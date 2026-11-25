import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "./order-status";

function define<T>(name: string, schema: Schema<T>) {
  // En développement, le rechargement à chaud garde l'ancien modèle : on le
  // reconstruit pour qu'un champ ajouté au schéma soit bien enregistré.
  if (process.env.NODE_ENV !== "production" && models[name]) mongoose.deleteModel(name);
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema);
}

export type AdminDoc = {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  // Incrémenté au changement de mot de passe : invalide les sessions ouvertes.
  sessionVersion: number;
};

export const Admin = define<AdminDoc>(
  "Admin",
  new Schema<AdminDoc>(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      sessionVersion: { type: Number, default: 1 },
    },
    { timestamps: true },
  ),
);

export type ProductDoc = {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  description: string;
  color: string;
  flowerType: string;
  shape: string;
  // Prix le plus bas parmi les tailles : sert aux filtres et au tri.
  basePrice: number;
  featured: boolean;
  published: boolean;
  inStock: boolean;
  sizes: { _id: Types.ObjectId; label: string; price: number }[];
  // uploadId est renseigné si la photo a été envoyée depuis le dashboard.
  images: { url: string; uploadId?: Types.ObjectId | null }[];
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String, required: true },
    flowerType: { type: String, required: true },
    shape: { type: String, default: "Dôme" },
    basePrice: { type: Number, required: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    inStock: { type: Boolean, default: true },
    sizes: [{ label: { type: String, required: true }, price: { type: Number, required: true } }],
    images: [
      {
        _id: false,
        url: { type: String, required: true },
        uploadId: { type: Schema.Types.ObjectId, default: null },
      },
    ],
  },
  { timestamps: true },
);
productSchema.index({ published: 1, featured: 1 });
productSchema.index({ published: 1, color: 1 });
productSchema.index({ published: 1, flowerType: 1 });

export const Product = define<ProductDoc>("Product", productSchema);

// Photos envoyées depuis le dashboard. Stockées en base pour survivre aux
// redéploiements, sans service de fichiers externe.
export type UploadDoc = { _id: Types.ObjectId; mime: string; data: Buffer };

export const Upload = define<UploadDoc>(
  "Upload",
  new Schema<UploadDoc>(
    {
      mime: { type: String, required: true },
      data: { type: Buffer, required: true },
    },
    { timestamps: true },
  ),
);

export type OrderItem = {
  productId?: Types.ObjectId | null;
  sizeId?: Types.ObjectId | null;
  productName: string;
  sizeLabel: string;
  scent?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
};

export type OrderDoc = {
  _id: Types.ObjectId;
  // Numéro lisible, affiché à la gérante et au client.
  number: number;
  // Jeton aléatoire de l'URL de suivi : un numéro séquentiel se devinerait.
  publicToken: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  // Les lignes copient nom et prix : une commande passée ne change pas si le
  // bouquet est modifié ou supprimé ensuite.
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

const orderSchema = new Schema<OrderDoc>(
  {
    number: { type: Number, required: true, unique: true },
    publicToken: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    note: { type: String, default: null },
    status: { type: String, enum: ORDER_STATUSES, default: "nouvelle" },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    items: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, default: null },
        sizeId: { type: Schema.Types.ObjectId, default: null },
        productName: { type: String, required: true },
        sizeLabel: { type: String, required: true },
        scent: { type: String, default: null },
        imageUrl: { type: String, default: null },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export const Order = define<OrderDoc>("Order", orderSchema);

// Compteur atomique des numéros de commande.
export type CounterDoc = { _id: string; seq: number };

export const Counter = define<CounterDoc>(
  "Counter",
  new Schema<CounterDoc>({ _id: { type: String, required: true }, seq: { type: Number, default: 0 } }),
);

export type SettingDoc = { key: string; value: string };

export const Setting = define<SettingDoc>(
  "Setting",
  new Schema<SettingDoc>({
    key: { type: String, required: true, unique: true },
    value: { type: String, default: "" },
  }),
);

// Limitation des tentatives (connexion, commandes).
export type RateLimitDoc = { key: string; count: number; resetAt: Date };

const rateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, required: true },
});
// MongoDB purge seul les compteurs expirés.
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = define<RateLimitDoc>("RateLimit", rateLimitSchema);
