import Category from "../models/categories.js";
import Item from "../models/items.js";
import User from "../models/users.js";

export const donateItem = async (req, res) => {
  try {
    console.log(" DONATE API HIT!");
    console.log(" Body:", req.body);
    console.log(" Files:", req.files?.length || 0);

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
      userId, 
      "contactMethods[]": contactMethods,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!itemTitle?.trim() || !category?.trim() || !location?.trim() || !condition) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const categoryDoc = await Category.findOne({ name: category.trim() });
    if (!categoryDoc) return res.status(400).json({ error: "Invalid category" });

    let finalPrice = 0;
    if (isPaid === "yes") {
      finalPrice = parseFloat(price);
      if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ error: "Valid price required" });
      }
    }

    const contactMethodsArray = Array.isArray(contactMethods)
      ? contactMethods
      : contactMethods
      ? [contactMethods]
      : ["email"]; 

    const finalDate = availableUntil ? new Date(availableUntil) : null;

    const newItem = await Item.create({
      name: itemTitle.trim(),
      description: description?.trim() || "",
      pickup: location.trim(),
      condition: condition.trim(),
      donorId: userId, 
      isPaid: isPaid === "yes",
      price: finalPrice,
      urgent: urgentDonation === "on",
      available_until: finalDate,
      categoryId: categoryDoc._id,
      subcategory: subcategory?.trim() || "",
      preferences: contactMethodsArray,
      imageURL: req.files?.map(f => `/uploads/${f.filename}`) || [],
    });

    console.log(" Item created:", newItem._id);

    res.status(201).json({
      success: true,
      message: "Donation created successfully!",
      itemId: newItem._id,
    });

  } catch (err) {
    console.error(" ERROR:", err);
    res.status(500).json({
      error: "Server Error",
      message: "Failed to create donation",
    });
  }
};
