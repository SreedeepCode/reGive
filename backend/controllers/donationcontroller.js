/*
1. Since no categories are assigned in the db yet the category search cannot be performed
2. Also commented the  the res.user since validation is not yet started we cannot use that
3. Since no category id is present i added random category id
*/
import Category from "../models/categories.js";
import Item from "../models/items.js";
import User from "../models/users.js"

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



    //increment points after  a donation
    await User.findByIdAndUpdate(req.user._id, {
  $inc: { points: 10 }  
});


    // Validate required fields
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

    
    // Find category document
    const categoryDoc = await Category.findOne({
     name: category.trim().replace(/\r?\n/g, " "),
     });

    if (!categoryDoc) {
       return res.status(400).json({
         error: "Invalid Category",
         message: "The selected category does not exist",
       });
     }

     //Find Donor

     

    // // Validate subcategory if provided
    // if (
    //   subcategory &&
    //   categoryDoc.subcategories &&
    //   categoryDoc.subcategories.length > 0
    // ) {
    //   const validSubcategory = categoryDoc.subcategories.includes(
    //     subcategory.trim()
    //   );
    //   if (!validSubcategory) {
    //     return res.status(400).json({
    //       error: "Invalid Subcategory",
    //       message: "The selected subcategory is not valid for this category",
    //     });
    //   }
    // }

    // Parse and validate price if it's a paid donation
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

    // Handle contact methods - ensure it's always an array
    let contactMethodsArray = [];
    if (contactMethods) {
      if (Array.isArray(contactMethods)) {
        contactMethodsArray = contactMethods;
      } else {
        contactMethodsArray = [contactMethods];
      }
    }


    //validating date
    // Validate availableUntil
let finalDate = null;
if (availableUntil) {
  finalDate = new Date(availableUntil);
  const today = new Date();
  today.setHours(0,0,0,0); // normalize to midnight

  if (isNaN(finalDate.getTime())) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid date format for availableUntil"
    });
  }

  if (finalDate < today) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Available until date cannot be in the past"
    });
  }
}


    // Handle image URLs // currently storing file paths, need to be changes to Urls when w store it in cloud
    const imageURLs =
      req.files && req.files.length > 0
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : [];

    // Create the item
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

    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        error: "Validation Error",
        message: messages.join(", "),
      });
    }

    // Handle duplicate key errors
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
