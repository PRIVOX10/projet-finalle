import "server-only";
import sharp from "sharp";
import { connectDb } from "./db";
import { Upload } from "./models";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class ImageError extends Error {}

/**
 * Réencode l'image : vérifie que c'est une vraie photo, la remet à l'endroit,
 * limite sa taille et retire les métadonnées (dont la localisation GPS).
 */
export async function saveUpload(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageError(`« ${file.name} » dépasse 5 Mo.`);
  }
  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    const image = sharp(input);
    const { format } = await image.metadata();
    if (!format || !ALLOWED_FORMATS.has(format)) {
      throw new ImageError(`« ${file.name} » : formats acceptés JPEG, PNG ou WebP.`);
    }
    output = await image
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    if (error instanceof ImageError) throw error;
    throw new ImageError(`« ${file.name} » n'est pas une image lisible.`);
  }
  await connectDb();
  const upload = await Upload.create({ mime: "image/webp", data: output });
  return { uploadId: upload._id, url: `/api/images/${upload._id}` };
}
