// routes/donation.js
import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verify.js";
import { donateItem } from "../controllers/donationcontroller.js";

const router = express.Router();
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/donate", upload.array("images", 5), donateItem);

export default router;
