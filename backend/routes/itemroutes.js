import express from "express";
import mongoose from "mongoose";
import Item from "../models/items.js";
import { getSearchResults } from "../controllers/itemController.js";

const router = express.Router();

const ensureLoggedIn = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  next();
};

router.get("/search", getSearchResults);

// GET /api/item/my-items - get items donated by logged-in user
router.get("/my-items", ensureLoggedIn, async (req, res) => {
  try {
    const items = await Item.find({ donorId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/:id", ensureLoggedIn, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid item ID" });
  }

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Only the donor can delete the item
    if (!item.donorId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    await Item.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
