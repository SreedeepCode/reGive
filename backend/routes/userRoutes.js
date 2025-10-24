import express from "express";
import User from "../models/users.js";
import { verifyToken } from "../middleware/verify.js";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL;

// GET /user-profile - Display user profile
// PUT /user-profile - Update user profile
router.put("/user-profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
