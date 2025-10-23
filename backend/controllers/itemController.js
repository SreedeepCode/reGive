/*import express from "express";
import mongoose from "mongoose";
import User from "../models/users.js";
import Item from "../models/items.js";
import Category from "../models/categories.js";

export const getSearchResults = async (req, res) => {
  const query = req.query.q; // e.g., "Stationery" or "baby doll"

  if (!query) {
    return res.render("../frontend/views/listing.ejs", { items: [] });
  }

  const regexQuery = new RegExp(query, "i");
  let items = [];

  try {
    const category = await Category.findOne({ name: regexQuery });

    if (category) {
      items = await Item.find({ categoryId: category._id })
        .populate("categoryId", "name")
        .populate("donorId", "displayName email")
        .exec();
    }

    if (items.length === 0) {
      items = await Item.find({
        $or: [
          { name: regexQuery },
          { description: regexQuery },
          { subcategory: regexQuery },
        ],
      })
        .populate("categoryId", "name")
        .populate("donorId", "displayName email")
        .exec();
    }

    res.render("itemListing.ejs", { items });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send("Error performing search.");
  }
};
*/
import express from "express";
import mongoose from "mongoose";
import User from "../models/users.js";
import Item from "../models/items.js";
import Category from "../models/categories.js";

export const getSearchResults = async (req, res) => {
 const query = req.query.q; // e.g., "Stationery" or "baby doll"
if (!query) {
 // Assuming you want to render the listing view, perhaps empty, if no query is present
return res.render("../frontend/views/listing.ejs", { items: [] });
 }

 const regexQuery = new RegExp(query, "i");
 let items = [];

 try {
 const category = await Category.findOne({ name: regexQuery });

if (category) {
 // Search 1: Find items by matching category name
 items = await Item.find({ categoryId: category._id })
.populate("categoryId", "name")
.populate("donorId", "displayName email") // <-- Fetching email
 // <-- Fetching subCategory name
.exec();
}

if (items.length === 0) {
 // Search 2: Find items by matching name, description, or subcategory field
 items = await Item.find({
 $or: [
 { name: regexQuery },
 { description: regexQuery },
// Note: Assuming 'subcategory' is a direct field on the Item model for text search
 { subcategory: regexQuery }, 
 ],
 })
 .populate("categoryId", "name")
.populate("donorId", "displayName email") // <-- Fetching email
         // <-- Fetching subCategory name
.exec();
 }
    
    // Process items to flatten category/subCategory names for easier EJS access
    const processedItems = items.map(item => ({
        ...item.toObject(),
        donorEmail: item.donorId ? item.donorId.email : null,
        categoryName: item.categoryId ? item.categoryId.name : 'N/A',
        subCategoryName: item.subCategoryId ? item.subCategoryId.name : null,
        // Remove complex objects
        donorId: undefined,
        categoryId: undefined,
        subCategoryId: undefined,
    }));


 res.render("itemListing.ejs", { items: processedItems });
 } catch (error) {
 console.error("Search error:", error);
 res.status(500).send("Error performing search.");
}
};
