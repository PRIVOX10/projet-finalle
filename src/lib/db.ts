import mongoose from "mongoose";

const globalForMongo = globalThis as unknown as { mongo?: Promise<typeof mongoose> };

/** Connexion unique, réutilisée entre les requêtes et les rechargements à chaud. */
export function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI manquant dans .env");

  globalForMongo.mongo ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .catch((error) => {
      // Sans ça, un échec au démarrage resterait en cache jusqu'au redémarrage.
      globalForMongo.mongo = undefined;
      throw error;
    });
  return globalForMongo.mongo;
}
