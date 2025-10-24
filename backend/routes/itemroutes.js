import { getSearchResults } from "../controllers/itemController.js";
import express from "express";
import mongoose from "mongoose";
import Item from "../models/items.js";
import { verifyToken } from "../middleware/verify.js";

const router = express.Router();
router.get("/search", getSearchResults);
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
router.get("/search", getSearchResults);

router.get("/my-items", verifyToken, async (req, res) => {
  try {
    const items = await Item.find({ donorId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid item ID" });
  }

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    if (!item.donorId.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this item",
      });
    }

    await Item.deleteOne({ _id: id });
    res
      .status(200)
      .json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
