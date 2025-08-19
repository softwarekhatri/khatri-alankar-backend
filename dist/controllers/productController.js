"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProductsBulk = deleteProductsBulk;
exports.getFilters = getFilters;
exports.listProducts = listProducts;
const Product_1 = require("../models/Product");
const zod_1 = require("zod");
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    metalType: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    weight: zod_1.z.string().optional(),
    price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((v) => typeof v === "string" ? parseFloat(v) : v).pipe(zod_1.z.number().nonnegative()),
    images: zod_1.z.array(zod_1.z.string().url()).default([]),
    isNewProduct: zod_1.z.boolean().default(false),
    isOnSale: zod_1.z.boolean().default(false),
    isFeatured: zod_1.z.boolean().default(false),
    availableSizes: zod_1.z.array(zod_1.z.string()).default([])
});
const updateSchema = productSchema.partial().omit({ code: true });
async function getProduct(req, res) {
    const { code } = req.params;
    const product = await Product_1.Product.findOne({ code }).lean();
    if (!product)
        return res.status(404).json({ error: "Product not found" });
    return res.json(product);
}
async function createProduct(req, res) {
    const parse = productSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
    }
    try {
        const exists = await Product_1.Product.findOne({ code: parse.data.code }).lean();
        if (exists)
            return res.status(409).json({ error: "Product code already exists" });
        const created = await Product_1.Product.create(parse.data);
        return res.status(201).json({ message: "Product created", product: created });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create product", details: err?.message });
    }
}
async function updateProduct(req, res) {
    const { code } = req.params;
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
    }
    try {
        const updated = await Product_1.Product.findOneAndUpdate({ code }, { $set: parse.data }, { new: true });
        if (!updated)
            return res.status(404).json({ error: "Product not found" });
        return res.json({ message: "Product updated", product: updated });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update product", details: err?.message });
    }
}
async function deleteProductsBulk(req, res) {
    const codes = (req.body?.codes ?? []);
    if (!Array.isArray(codes) || codes.length === 0) {
        return res.status(400).json({ error: "codes must be a non-empty array" });
    }
    try {
        const result = await Product_1.Product.deleteMany({ code: { $in: codes } });
        return res.json({ message: "Deleted products", requested: codes.length, deleted: result.deletedCount ?? 0 });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete products", details: err?.message });
    }
}
async function getFilters(_req, res) {
    try {
        const [categories, metalTypes] = await Promise.all([
            Product_1.Product.distinct("category", { category: { $nin: [null, ""] } }),
            Product_1.Product.distinct("metalType", { metalType: { $nin: [null, ""] } })
        ]);
        return res.json({ categories: categories.sort(), metalTypes: metalTypes.sort() });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch filters", details: err?.message });
    }
}
async function listProducts(req, res) {
    try {
        const { page = "1", limit = "12", sortBy = "createdAt", sortOrder = "desc", code, name, gender, category, metalType, onSale } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
        const filter = {};
        if (code)
            filter.code = new RegExp(`^${escapeRegex(code)}`, "i");
        if (name)
            filter.name = new RegExp(escapeRegex(name), "i");
        if (gender)
            filter.gender = gender;
        if (category)
            filter.category = category;
        if (metalType)
            filter.metalType = metalType;
        if (typeof onSale !== "undefined")
            filter.isOnSale = ["true", "1", "yes"].includes(String(onSale).toLowerCase());
        const sort = { [sortBy]: sortOrder?.toLowerCase() === "asc" ? 1 : -1 };
        const [items, total] = await Promise.all([
            Product_1.Product.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            Product_1.Product.countDocuments(filter)
        ]);
        return res.json({
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            items
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to list products", details: err?.message });
    }
}
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
