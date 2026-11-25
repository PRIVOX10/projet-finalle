import "server-only";
import { headers } from "next/headers";
import { connectDb } from "./db";
import { RateLimit } from "./models";

export async function clientIp() {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "local";
}

/** Compte une tentative. Renvoie false si la limite de la fenêtre est atteinte. */
export async function consumeLimit(key: string, limit: number, windowMs: number) {
  await connectDb();
  const now = new Date();
  const current = await RateLimit.findOneAndUpdate(
    { key, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true },
  ).lean();
  if (current) return current.count <= limit;

  await RateLimit.updateOne(
    { key },
    { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
    { upsert: true },
  );
  return true;
}

export async function clearLimit(key: string) {
  await connectDb();
  await RateLimit.deleteOne({ key });
}
