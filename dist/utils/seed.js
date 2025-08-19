"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const Product_1 = require("../models/Product");
async function run() {
    await (0, db_1.connectDB)();
    const code = "KA-R001";
    const exists = await Product_1.Product.findOne({ code });
    if (exists) {
        console.log("Seed product already exists");
        process.exit(0);
    }
    await Product_1.Product.create({
        name: "Diamond Solitaire Ring",
        code: "KA-R001",
        description: "Elegant 1ct diamond ring crafted in premium 18k gold. This timeless piece features a brilliant-cut diamond set in a classic solitaire setting, perfect for engagements or special occasions.",
        category: "Rings",
        metalType: "Gold 916",
        gender: "Female",
        weight: "3.5g",
        price: 125000.00,
        images: [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
        ],
        isNewProduct: true,
        isOnSale: false,
        isFeatured: false,
        availableSizes: ["14", "16", "18", "20"]
    });
    console.log("Seed product inserted");
    process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
