import { Request, Response } from "express";
import { Product, IProduct } from "../models/Product";
import { z } from "zod";
import { CategoryEnum, MetalTypeEnum, CategoryDisplay, MetalTypeDisplay } from "../models/Product";

const productSchema = z.object({
  name: z.string().min(1),
  // code is not required from client, will be generated
  description: z.string().optional(),
  category: z.nativeEnum(CategoryEnum),
  metalType: z.nativeEnum(MetalTypeEnum),
  gender: z.string().optional(),
  weight: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform((v) => typeof v === "string" ? parseFloat(v) : v).pipe(z.number().nonnegative()),
  images: z.array(z.string().url()).default([]),
  isNewProduct: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  availableSizes: z.array(z.string()).default([])
});

const updateSchema = productSchema.partial();

export async function getProduct(req: Request, res: Response) {
  const { code } = req.params;
  const product = await Product.findOne({ code }).lean();
  if (!product || Array.isArray(product)) return res.status(404).json({ error: "Product not found" });
  if (product.category && product.category.code) {
    product.category.displayName = CategoryDisplay[product.category.code as CategoryEnum] || product.category.displayName || '';
  }
  if (product.metalType && product.metalType.code) {
    product.metalType.displayName = MetalTypeDisplay[product.metalType.code as MetalTypeEnum] || product.metalType.displayName || '';
  }
  return res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  const parse = productSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
  }
  try {
    // Generate product code: KA-{categoryCode}{sequence}
    const { category, metalType, name, description, gender, weight, price, images, isNewProduct, isOnSale, isFeatured, availableSizes } = parse.data;
    // Find the latest product for this category
    const lastProduct = await Product.findOne({
      "category.code": category
    }).sort({ code: -1 }).lean();
    let nextSeq = 1;
    if (lastProduct && !Array.isArray(lastProduct) && lastProduct.code) {
      const match = lastProduct.code.match(/(\d{3,})$/);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
    const code = `KA-${category}${nextSeq.toString().padStart(3, "0")}`;
    // Check for duplicate code (shouldn't happen, but just in case)
    const exists = await Product.findOne({ code }).lean();
    if (exists) return res.status(409).json({ error: "Product code already exists" });
    const productToCreate: Partial<IProduct> = {
      name,
      code,
      description,
      category: {
        code: category,
        displayName: CategoryDisplay[category]
      },
      metalType: {
        code: metalType,
        displayName: MetalTypeDisplay[metalType]
      },
      gender,
      weight,
      price,
      images,
      isNewProduct,
      isOnSale,
      isFeatured,
      availableSizes
    };
    const created = await Product.create(productToCreate);
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
    // Return all possible enums for category and metalType
    const categories = Object.values(CategoryEnum).map((code) => ({
      code,
      displayName: CategoryDisplay[code as CategoryEnum]
    }));
    const metalTypes = Object.values(MetalTypeEnum).map((code) => ({
      code,
      displayName: MetalTypeDisplay[code as MetalTypeEnum]
    }));
    return res.json({ categories, metalTypes });
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
      onSale,
      search
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 12));

    const filter: any = {};
    if (search) {
      // If search is present, match code exactly or name partial (case-insensitive)
      filter.$or = [
        { code: search },
        { name: { $regex: escapeRegex(search), $options: "i" } }
      ];
    }
    if (code) filter.code = new RegExp(`^${escapeRegex(code)}`, "i");
    if (name) filter.name = new RegExp(escapeRegex(name), "i");
    if (gender) filter.gender = gender;
    if (category) filter["category.code"] = category;
    if (metalType) filter["metalType.code"] = metalType;
    if (typeof onSale !== "undefined") filter.isOnSale = ["true", "1", "yes"].includes(String(onSale).toLowerCase());

    const sort: any = { [sortBy]: sortOrder?.toLowerCase() === "asc" ? 1 : -1 };

    console.log("filetr obj, ", filter);
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select("code name description images isFeatured isOnSale isNewProduct createdAt")
        .lean(),
      Product.countDocuments(filter)
    ]);
    console.log({
      filter,
      pageNum: pageNum,
      skip: (pageNum - 1) * limitNum,
      limit: limitNum
    });

    // Return only the first image and required fields
    const itemsOptimized = items.map((product) => ({
      code: product.code,
      name: product.name,
      description: product.description,
      images: Array.isArray(product.images) && product.images.length > 0 ? [product.images[0]] : [],
      isFeatured: product.isFeatured,
      isOnSale: product.isOnSale,
      isNewProduct: product.isNewProduct
    }));

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      items: itemsOptimized
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to list products", details: err?.message });
  }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
