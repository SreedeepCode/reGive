import express from "express";
import {
  GetUserProfile,
  UpdateUserProfile,
  GetUserStats,
  GetUserListings,
  GetUserDonations,
  RemoveUserListing,
} from "../controllers/usercontroller.js";
const router = express.Router();

router.get("/profile", GetUserProfile);
router.put("/profile", UpdateUserProfile);
router.get("/:userId/stats", GetUserStats);
router.get("/:userId/listings", GetUserListings);
router.get("/:userId/donations", GetUserDonations);
router.delete("/listings/:listingId", RemoveUserListing);

export default router;
