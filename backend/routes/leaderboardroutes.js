import express from "express";
import User from "../models/users.js";

const router = express.Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const topDonors = await User.find({}, "displayName profile points")
      .sort({ points: -1 })
      .limit(5);

    res.json(topDonors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
