import express from "express";
import { verifyToken } from "../middleware/verify.js";
import { refreshToken, getRole } from "../controllers/authController.js";
const router = express.Router();

router.post("/refresh-token", refreshToken);

router.get("/get-role", verifyToken, getRole);

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
