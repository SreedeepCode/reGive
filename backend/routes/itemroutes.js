import express from "express";
import mongoose from "mongoose";
import Item from "../models/items.js";

const router = express.Router();


router.put("/:id/claim", async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { status: "claimed" },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item successfully claimed", item });
  } catch (err) {
    console.error("Error claiming item:", err);
    res.status(500).json({ message: "Failed to claim item" });
  }
});

import { getSearchResults } from "../controllers/itemController.js";
router.get("/search", getSearchResults);
export default router;
