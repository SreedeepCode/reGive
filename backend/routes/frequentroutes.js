import express from "express";
import Item from "../models/items.js";

const router = express.Router();

router.get("/latest", async (req, res) => {
  try {
    const latestItems = await Item.find({ status: "available" }) 
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("categoryId", "name")
      .populate("donorId", "displayName email phone")
      .exec();

    res.json(latestItems);
  } catch (err) {
    console.error("Error fetching latest items:", err);
    res.status(500).json({ error: "Failed to fetch latest items" });
  }
});


export default router;



