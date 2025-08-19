import mongoose, { Schema, Document } from "mongoose";

export enum CategoryEnum {
  RING = "RG",
  NECKLACE = "NL",
  EARRING = "ER",
  BANGLE = "BG",
  ANKLET = "AK",
  BRACELET = "BR",
  PENDANT = "PD",
  NOSEPIN = "NP",
  TOE_RING = "TR",
  CHAIN = "CH",
  MANGALSUTRA = "MS"
}

export const CategoryDisplay: Record<CategoryEnum, string> = {
  [CategoryEnum.RING]: "Ring (अंगूठी)",
  [CategoryEnum.NECKLACE]: "Necklace (हार)",
  [CategoryEnum.EARRING]: "Earring (झुमका)",
  [CategoryEnum.BANGLE]: "Bangle (चूड़ी)",
  [CategoryEnum.ANKLET]: "Anklet (पायल)",
  [CategoryEnum.BRACELET]: "Bracelet (कड़ा)",
  [CategoryEnum.PENDANT]: "Pendant (लॉकेट)",
  [CategoryEnum.NOSEPIN]: "Nose Pin (नथ)",
  [CategoryEnum.TOE_RING]: "Toe Ring (बिचुए)",
  [CategoryEnum.CHAIN]: "Chain (चेन)",
  [CategoryEnum.MANGALSUTRA]: "Mangalsutra (मंगलसूत्र)"
};

export enum MetalTypeEnum {
  GOLD_916 = "G916",
  GOLD_750 = "G750"
}
export const MetalTypeDisplay: Record<MetalTypeEnum, string> = {
  [MetalTypeEnum.GOLD_916]: "Gold 916",
  [MetalTypeEnum.GOLD_750]: "Gold 750"
};


export interface IProduct extends Document {
  name: string;
  code: string;
  description?: string;
  category: {
    code: CategoryEnum;
    displayName: string;
  };
  metalType: {
    code: MetalTypeEnum;
    displayName: string;
  };
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
  category: {
    code: { type: String, enum: Object.values(CategoryEnum), required: true, index: true, unique: true },
    displayName: { type: String, required: true }
  },
  metalType: {
    code: { type: String, enum: Object.values(MetalTypeEnum), required: true, index: true, unique: true },
    displayName: { type: String, required: true }
  },
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
