import "server-only";
import { cache } from "react";
import { connectDb } from "./db";
import { Setting } from "./models";

export const SCENT_COUNT = 5;
export const DEFAULT_SCENTS = ["Vanille", "Rose", "Jasmin", "Fleur d'oranger", "Musc blanc"];

export const DEFAULT_SETTINGS = {
  whatsapp: "",
  instagram: "kandili._",
  email: "",
  currency: "DA",
  deliveryFee: "0",
  // Une senteur par ligne.
  scents: DEFAULT_SCENTS.join("\n"),
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export type ShopSettings = {
  whatsapp: string;
  instagram: string;
  email: string;
  currency: string;
  deliveryFee: number;
  scents: string[];
};

export const getSettings = cache(async (): Promise<ShopSettings> => {
  await connectDb();
  const rows = await Setting.find().lean();
  const values = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in values) values[row.key as SettingKey] = row.value;
  }
  const scents = values.scents
    .split("\n")
    .map((scent) => scent.trim())
    .filter(Boolean);
  return {
    ...values,
    deliveryFee: Number(values.deliveryFee) || 0,
    scents: scents.length ? scents : DEFAULT_SCENTS,
  };
});
