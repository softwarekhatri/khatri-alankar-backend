
import { Request, Response } from "express";
import { Product, IProduct } from "../models/Product";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  metalType: z.string().optional(),
  gender: z.string().optional(),
  weight: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform((v) => typeof v === "string" ? parseFloat(v) : v).pipe(z.number().nonnegative()),
  images: z.array(z.string().url()).default([]),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  availableSizes: z.array(z.string()).default([])
});

const updateSchema = productSchema.partial().omit({ code: true });

export async function getProduct(req: Request, res: Response) {
  const { code } = req.params;
  const product = await Product.findOne({ code }).lean();
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  const parse = productSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
  }
  try {
    const exists = await Product.findOne({ code: parse.data.code }).lean();
    if (exists) return res.status(409).json({ error: "Product code already exists" });
    const created = await Product.create(parse.data as Partial<IProduct>);
    return res.status(201).json({ message: "Product created", product: created });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to create product", details: err?.message });
  }
}

export async function updateProduct(req: Request, res: Response) {
  const { code } = req.params;
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
  }
  try {
    const updated = await Product.findOneAndUpdate({ code }, { $set: parse.data }, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    return res.json({ message: "Product updated", product: updated });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update product", details: err?.message });
  }
}

export async function deleteProductsBulk(req: Request, res: Response) {
  const codes = (req.body?.codes ?? []) as string[];
  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: "codes must be a non-empty array" });
  }
  try {
    const result = await Product.deleteMany({ code: { $in: codes } });
    return res.json({ message: "Deleted products", requested: codes.length, deleted: result.deletedCount ?? 0 });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete products", details: err?.message });
  }
}

export async function getFilters(_req: Request, res: Response) {
  try {
    const [categories, metalTypes] = await Promise.all([
      Product.distinct("category", { category: { $nin: [null, ""] } }),
      Product.distinct("metalType", { metalType: { $nin: [null, ""] } })
    ]);
    return res.json({ categories: categories.sort(), metalTypes: metalTypes.sort() });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch filters", details: err?.message });
  }
}

export async function listProducts(req: Request, res: Response) {
  try {
    const {
      page = "1",
      limit = "12",
      sortBy = "createdAt",
      sortOrder = "desc",
      code,
      name,
      gender,
      category,
      metalType,
      onSale
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 12));

    const filter: any = {};
    if (code) filter.code = new RegExp(`^${escapeRegex(code)}`, "i");
    if (name) filter.name = new RegExp(escapeRegex(name), "i");
    if (gender) filter.gender = gender;
    if (category) filter.category = category;
    if (metalType) filter.metalType = metalType;
    if (typeof onSale !== "undefined") filter.isOnSale = ["true", "1", "yes"].includes(String(onSale).toLowerCase());

    const sort: any = { [sortBy]: sortOrder?.toLowerCase() === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Product.countDocuments(filter)
    ]);

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      items
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to list products", details: err?.message });
  }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
