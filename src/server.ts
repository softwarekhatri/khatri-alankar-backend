
import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import productRoutes from "./routes/productRoutes";
import { getFilters } from "./controllers/productController";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/products", productRoutes);
app.get("/api/filters", getFilters);

connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

if (process.env.VERCEL !== "1" && !process.env.NOW_REGION) {
  const PORT = ENV.PORT;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

export default app;
export const handler = serverless(app);
