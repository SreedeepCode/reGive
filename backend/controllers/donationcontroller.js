import Category from "../models/categories.js";
import Item from "../models/items.js";
import User from "../models/users.js";

export const donateItem = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const {
      itemTitle,
      description,
      category,
      subcategory,
      condition,
      location,
      availableUntil,
      urgentDonation,
      isPaid,
      price,
      contactMethods,
    } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 10 },
    });

    if (!itemTitle || !itemTitle.trim()) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Item title is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Category is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Location is required",
      });
    }

    const categoryDoc = await Category.findOne({
      name: category.trim().replace(/\r?\n/g, " "),
    });

    if (!categoryDoc) {
      return res.status(400).json({
        error: "Invalid Category",
        message: "The selected category does not exist",
      });
    }

    let finalPrice = 0;
    if (isPaid === "yes" || isPaid === true) {
      finalPrice = parseFloat(price);
      if (isNaN(finalPrice) || finalPrice < 0) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please provide a valid price",
        });
      }
    }

    let contactMethodsArray = [];
    if (contactMethods) {
      if (Array.isArray(contactMethods)) {
        contactMethodsArray = contactMethods;
      } else {
        contactMethodsArray = [contactMethods];
      }
    }

    let finalDate = null;
    if (availableUntil) {
      finalDate = new Date(availableUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(finalDate.getTime())) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid date format for availableUntil",
        });
      }

      if (finalDate < today) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Available until date cannot be in the past",
        });
      }
    }

    const imageURLs =
      req.files && req.files.length > 0
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : [];

    const newItem = await Item.create({
      name: itemTitle.trim(),
      description: description ? description.trim() : "",
      pickup: location.trim(),
      condition: condition.trim(),
      donorId: req.user._id,
      isPaid: isPaid === "yes" || isPaid === true,
      price: finalPrice,
      urgent:
        urgentDonation === "on" ||
        urgentDonation === "true" ||
        urgentDonation === true,
      available_until: finalDate || null,
      categoryId: categoryDoc._id,
      subcategory: subcategory ? subcategory.trim() : "",
      preferences: contactMethodsArray,
      imageURL: imageURLs,
    });

    console.log("Item created successfully:", newItem);

    return res.status(201).json({
      success: true,
      message: "Donation created successfully",
      item: newItem,
    });
  } catch (err) {
    console.error("Donation error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        error: "Validation Error",
        message: messages.join(", "),
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        error: "Duplicate Error",
        message: "This item already exists",
      });
    }

    return res.status(500).json({
      error: "Server Error",
      message: "Failed to save donation. Please try again later.",
    });
  }
};
