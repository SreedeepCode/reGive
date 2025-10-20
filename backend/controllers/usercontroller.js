import express from "express";
import user from "../models/users.js";
import item from "../models/items.js";
import transactions from "../models/transaction.js";
import reports from "../models/reports.js";

export const GetUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userProfile = await user.findById(userId).select("-password");

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UpdateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await user.findOne({
      email: email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updatedUser = await user
      .findByIdAndUpdate(
        userId,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userDoc = await user.findById(userId).select("points");

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemsDonatedCount = await transactions.countDocuments({
      donorid: userId,
      status: "completed",
    });

    const pointsFromTransactions = await transactions.aggregate([
      { $match: { donorid: userId, status: "completed" } },
      { $group: { _id: null, totalPoints: { $sum: "$points" } } },
    ]);

    const totalPoints =
      userDoc.points ||
      (pointsFromTransactions.length > 0
        ? pointsFromTransactions[0].totalPoints
        : 0);

    res.status(200).json({
      success: true,
      totalPoints: totalPoints || 0,
      itemsDonated: itemsDonatedCount || 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetUserListings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userListings = await item
      .find({
        donorId: userId,
        status: { $in: ["available", "reserved"] },
      })
      .populate("categoryId", "name");

    const formattedListings = userListings.map((listing) => ({
      _id: listing._id,
      name: listing.name,
      condition: listing.condition,
      imageUrl: listing.imageURL,
      status: listing.status,
    }));

    res.status(200).json(formattedListings);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetUserDonations = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userDonations = await transactions
      .find({
        donorid: userId,
        status: "completed",
      })
      .populate("itemId", "name categoryId")
      .populate({
        path: "itemId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      })
      .sort({ timestamp: -1 });

    const formattedDonations = userDonations.map((donation) => ({
      _id: donation._id,
      itemName: donation.itemId?.name || "Unknown Item",
      categoryName: donation.itemId?.categoryId?.name || "Unknown Category",
      donatedAt: donation.timestamp,
      pointsEarned: donation.points || donation.amount || 0,
    }));

    res.status(200).json(formattedDonations);
  } catch (error) {
    console.error("Error fetching user donations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const RemoveUserListing = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required" });
    }

    const listing = await item.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.donorId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You can only remove your own listings",
      });
    }

    await item.findByIdAndDelete(listingId);

    res.status(200).json({
      success: true,
      message: "Listing removed successfully",
    });
  } catch (error) {
    console.error("Error removing user listing:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
