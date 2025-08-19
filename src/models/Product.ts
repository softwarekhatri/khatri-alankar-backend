
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  code: string;
  description?: string;
  category?: string;
  metalType?: string;
  gender?: string;
  weight?: string;
  price: number;
  images: string[];
  isNewProduct: boolean;
  isOnSale: boolean;
  isFeatured: boolean;
  availableSizes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, index: true, trim: true },
  description: { type: String, default: "" },
  category: { type: String, index: true, trim: true },
  metalType: { type: String, index: true, trim: true },
  gender: { type: String, index: true, trim: true },
  weight: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  isNewProduct: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  availableSizes: { type: [String], default: [] }
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
