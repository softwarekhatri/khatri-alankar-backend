
import { Router } from "express";
import {
  getProduct,
  createProduct,
  updateProduct,
  deleteProductsBulk,
  getFilters,
  listProducts
} from "../controllers/productController";

const router = Router();

router.get("/", listProducts);
router.get("/:code", getProduct);
router.post("/", createProduct);
router.put("/:code", updateProduct);
router.delete("/", deleteProductsBulk);

export default router;
