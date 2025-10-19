import express from "express";
import mongoose from "mongoose";
import User from "../models/users.js";
import Item from "../models/items.js";
import Category from "../models/categories.js";

export const getSearchResults = async (req, res) => {
  const query = req.query.q;

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
