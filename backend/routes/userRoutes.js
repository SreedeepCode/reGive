import express from "express";
import User from "../models/users.js";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL;

// GET /user-profile - Display user profile
router.get("/user-profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/auth/google");
  res.render("user-profile", { user: req.user });
});

// PUT /user-profile - Update user profile
router.put("/user-profile", async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Not authenticated" });

  try {
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

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
