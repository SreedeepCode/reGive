import express from "express";
import mongoose from "mongoose";

import { getSearchResults } from "../controllers/itemController.js";
const router = express.Router();

router.get("/search", getSearchResults);

// GET /api/item/my-items - get items donated by logged-in user
router.get("/my-items", async (req, res) => {
  try {
    const items = await Item.find({ donorId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
