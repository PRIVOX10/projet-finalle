import "server-only";
import { cache } from "react";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDb } from "./db";
import { Admin } from "./models";
import { SESSION_COOKIE, SESSION_MAX_AGE, readSession, signSession } from "./session";

export const getAdmin = cache(async () => {
  const store = await cookies();
  const session = await readSession(store.get(SESSION_COOKIE)?.value);
  if (!session || !isValidObjectId(session.adminId)) return null;
  await connectDb();
  const admin = await Admin.findById(session.adminId).lean();
  if (!admin || admin.sessionVersion !== session.version) return null;
  return admin;
});

/** À appeler en tête de chaque page et action d'administration. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function startSession(adminId: string, version: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession({ adminId, version }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
