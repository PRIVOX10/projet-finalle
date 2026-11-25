import { isValidObjectId } from "mongoose";
import { connectDb } from "@/lib/db";
import { Upload } from "@/lib/models";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return new Response("Image introuvable", { status: 404 });

  await connectDb();
  const upload = await Upload.findById(id);
  if (!upload) return new Response("Image introuvable", { status: 404 });

  return new Response(new Uint8Array(upload.data), {
    headers: {
      "Content-Type": upload.mime,
      // Une image envoyée ne change jamais : un remplacement crée un nouvel id.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
