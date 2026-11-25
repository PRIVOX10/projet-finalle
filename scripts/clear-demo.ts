// Vide le catalogue et les commandes de démonstration avant le lancement.
// Le compte gérante et les réglages sont conservés.
import mongoose from "mongoose";
import { connectDb } from "../src/lib/db";
import { Counter, Order, Product, Upload } from "../src/lib/models";

async function main() {
  await connectDb();
  const orders = await Order.deleteMany();
  const products = await Product.deleteMany();
  await Upload.deleteMany();
  await Counter.deleteMany();
  console.log(`${orders.deletedCount} commandes et ${products.deletedCount} bouquets supprimés.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
