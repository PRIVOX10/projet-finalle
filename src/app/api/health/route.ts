import mongoose from "mongoose";
import { connectDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Vérifiée par Render : le site ne passe en ligne que si la base répond. */
export async function GET() {
  try {
    await connectDb();
    await mongoose.connection.db?.admin().ping();
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "database_unreachable" }, { status: 503 });
  }
}
