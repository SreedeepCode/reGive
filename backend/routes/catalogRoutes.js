import express from "express";
import {
  getAllCategories,
  getProductsByCategory,
  searchProducts,
  getProductsBySubcategory,
} from "../controllers/catalogController.js";

const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/search", searchProducts);
router.get("/subcategory/:categoryId/:subcategory", getProductsBySubcategory);

export default router;
