"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const productController_1 = require("./controllers/productController");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));
app.use("/api/products", productRoutes_1.default);
app.get("/api/filters", productController_1.getFilters);
(0, db_1.connectDB)().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});
if (process.env.VERCEL !== "1" && !process.env.NOW_REGION) {
    const PORT = env_1.ENV.PORT;
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}
module.exports = app;
module.exports.handler = (0, serverless_http_1.default)(app);
