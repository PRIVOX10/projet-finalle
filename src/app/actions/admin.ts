"use server";

import bcrypt from "bcryptjs";
import { isValidObjectId, Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { normalizeLabel, slugify } from "@/lib/format";
import { ImageError, saveUpload } from "@/lib/images";
import { Admin, Order, Product, Setting, Upload } from "@/lib/models";
import { isOrderStatus } from "@/lib/order-status";
import { normalizePhone } from "@/lib/phone";
import { SCENT_COUNT } from "@/lib/settings";
import { clearLimit, clientIp, consumeLimit } from "@/lib/rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const MAX_IMAGES = 8;

// Comparé quand le compte n'existe pas, pour que la réponse prenne le même temps.
const DUMMY_HASH = "$2b$12$QQQE6r6RzDnfxWDf59.wZOg2vSUwsGtMZ2HghrvNUlKWaAHLRWuvq";

export type FormState = { error?: string; success?: string; email?: string };

export async function login(_state: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  const limitKey = `login:${await clientIp()}`;
  if (!(await consumeLimit(limitKey, 5, FIFTEEN_MINUTES))) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes.", email };
  }

  await connectDb();
  const admin = await Admin.findOne({ email }).lean();
  const valid = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !valid) return { error: "E-mail ou mot de passe incorrect.", email };

  await clearLimit(limitKey);
  await startSession(String(admin._id), admin.sessionVersion);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Indiquez un nom.").max(80),
  description: z.string().trim().min(10, "La description est trop courte.").max(2000),
  color: z.string().trim().min(1, "Indiquez une couleur.").max(40),
  flowerType: z.string().trim().min(1, "Indiquez un type de fleur.").max(40),
  shape: z.string().trim().min(1, "Indiquez une forme.").max(40),
  sizes: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().trim().min(1, "Chaque taille doit avoir un nom.").max(60),
        price: z.number("Chaque taille doit avoir un prix.").int().min(0).max(10_000_000),
      }),
    )
    .min(1, "Ajoutez au moins une taille.")
    .max(8),
  keepImages: z.array(z.string()).max(MAX_IMAGES),
});

function parseJson(value: FormDataEntryValue | null) {
  try {
    return JSON.parse(String(value ?? "[]")) as unknown;
  } catch {
    return [];
  }
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "bouquet";
  let slug = base;
  for (let suffix = 2; await Product.exists({ slug }); suffix++) slug = `${base}-${suffix}`;
  return slug;
}

export async function saveProduct(id: string | null, form: FormData): Promise<FormState> {
  await requireAdmin();
  await connectDb();

  const parsed = productSchema.safeParse({
    name: form.get("name"),
    description: form.get("description"),
    color: form.get("color"),
    flowerType: form.get("flowerType"),
    shape: form.get("shape"),
    sizes: parseJson(form.get("sizes")),
    keepImages: parseJson(form.get("keepImages")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const { keepImages, sizes, ...fields } = parsed.data;

  const existing = id ? await Product.findById(isValidObjectId(id) ? id : null) : null;
  if (id && !existing) return { error: "Ce bouquet n'existe plus." };

  const files = form.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
  const kept = (existing?.images ?? []).filter((image) => keepImages.includes(image.url));
  // Conserve l'ordre choisi dans le formulaire.
  kept.sort((a, b) => keepImages.indexOf(a.url) - keepImages.indexOf(b.url));

  if (kept.length + files.length === 0) return { error: "Ajoutez au moins une photo." };
  if (kept.length + files.length > MAX_IMAGES) return { error: `${MAX_IMAGES} photos maximum.` };

  const added: { url: string; uploadId: Types.ObjectId }[] = [];
  try {
    for (const file of files) added.push(await saveUpload(file));
  } catch (error) {
    await Upload.deleteMany({ _id: { $in: added.map((image) => image.uploadId) } });
    if (error instanceof ImageError) return { error: error.message };
    throw error;
  }

  // Une taille existante garde son identifiant : les paniers en cours restent valides.
  const knownSizes = new Set(existing?.sizes.map((size) => String(size._id)));
  const data = {
    ...fields,
    color: normalizeLabel(fields.color),
    flowerType: normalizeLabel(fields.flowerType),
    shape: normalizeLabel(fields.shape),
    basePrice: Math.min(...sizes.map((size) => size.price)),
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    inStock: form.get("inStock") === "on",
    sizes: sizes.map(({ id: sizeId, label, price }) =>
      sizeId && knownSizes.has(sizeId) ? { _id: sizeId, label, price } : { label, price },
    ),
    images: [...kept, ...added],
  };

  if (existing) {
    const removed = existing.images.filter((image) => !keepImages.includes(image.url));
    existing.set(data);
    await existing.save();
    const uploadIds = removed.flatMap((image) => (image.uploadId ? [image.uploadId] : []));
    if (uploadIds.length) await Upload.deleteMany({ _id: { $in: uploadIds } });
  } else {
    await Product.create({ ...data, slug: await uniqueSlug(fields.name) });
  }

  revalidatePath("/", "layout");
  redirect("/admin/bouquets");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await connectDb();
  if (!isValidObjectId(id)) return;
  // Les commandes gardent leur copie du nom et du prix.
  const product = await Product.findByIdAndDelete(id).lean();
  const uploadIds = product?.images.flatMap((image) => (image.uploadId ? [image.uploadId] : [])) ?? [];
  if (uploadIds.length) await Upload.deleteMany({ _id: { $in: uploadIds } });
  revalidatePath("/", "layout");
  redirect("/admin/bouquets");
}

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!isValidObjectId(id) || !isOrderStatus(status)) return;
  await connectDb();
  await Order.updateOne({ _id: id }, { $set: { status } });
  revalidatePath("/", "layout");
}

const settingsSchema = z.object({
  whatsapp: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (!value) return "";
      const phone = normalizePhone(value);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Le numéro WhatsApp n'est pas valide." });
        return z.NEVER;
      }
      return phone;
    }),
  instagram: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .pipe(z.string().regex(/^[\w.]{0,30}$/, "Le nom Instagram n'est pas valide.")),
  email: z.union([z.literal(""), z.email("L'adresse e-mail n'est pas valide.")]),
  currency: z.string().trim().min(1, "Indiquez une devise.").max(6),
  deliveryFee: z.coerce
    .number("Les frais de livraison doivent être un nombre.")
    .int("Les frais de livraison doivent être un nombre entier.")
    .min(0)
    .max(1_000_000),
});

export async function saveSettings(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const scents = form.getAll("scents").map((value) => String(value).trim().replace(/\s+/g, " "));
  if (scents.length !== SCENT_COUNT || scents.some((scent) => !scent)) {
    return { error: `Indiquez les ${SCENT_COUNT} senteurs.` };
  }
  if (scents.some((scent) => scent.length > 40)) return { error: "Une senteur fait 40 caractères maximum." };
  if (new Set(scents.map((scent) => scent.toLowerCase())).size !== scents.length) {
    return { error: "Deux senteurs portent le même nom." };
  }

  await connectDb();
  await Setting.bulkWrite(
    Object.entries({ ...parsed.data, scents: scents.join("\n") }).map(([key, value]) => ({
      updateOne: { filter: { key }, update: { $set: { value: String(value) } }, upsert: true },
    })),
  );
  revalidatePath("/", "layout");
  return { success: "Réglages enregistrés." };
}

export async function changePassword(_state: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");

  if (next.length < 10) return { error: "Le nouveau mot de passe doit faire au moins 10 caractères." };
  if (next !== form.get("confirm")) return { error: "Les deux mots de passe ne correspondent pas." };
  if (!(await bcrypt.compare(current, admin.passwordHash))) {
    return { error: "Le mot de passe actuel est incorrect." };
  }

  const sessionVersion = admin.sessionVersion + 1;
  await Admin.updateOne(
    { _id: admin._id },
    { $set: { passwordHash: await bcrypt.hash(next, 12), sessionVersion } },
  );
  // Déconnecte les autres appareils, garde celui-ci connecté.
  await startSession(String(admin._id), sessionVersion);
  return { success: "Mot de passe modifié." };
}
