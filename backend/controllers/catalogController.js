import Category from "../models/categories.js";
import Item from "../models/items.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const items = await Item.find({ categoryId })
      .populate("categoryId", "name description")
      .populate("donorId", "displayName email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("Error fetching items by category:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.json({
        success: true,
        type: "empty",
        results: [],
      });
    }

    const regexQuery = new RegExp(query, "i");
    let results = [];
    let searchType = "product";

    const category = await Category.findOne({ name: regexQuery });
    if (category) {
      const categoryItems = await Item.find({ categoryId: category._id })
        .populate("categoryId", "name description")
        .populate("donorId", "displayName email phone")
        .sort({ createdAt: -1 });

      results = categoryItems;
      searchType = "category";
    }

    if (results.length === 0) {
      results = await Item.find({
        $or: [
          { name: regexQuery },
          { description: regexQuery },
          { subcategory: regexQuery },
        ],
      })
        .populate("categoryId", "name description")
        .populate("donorId", "displayName email phone")
        .sort({ createdAt: -1 });

      searchType = "product";
    }

    res.json({
      success: true,
      type: searchType,
      query,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to perform search" });
  }
};

export const getProductsBySubcategory = async (req, res) => {
  try {
    const { categoryId, subcategory } = req.params;

    const items = await Item.find({
      categoryId,
      subcategory: new RegExp(subcategory, "i"),
    })
      .populate("categoryId", "name description")
      .populate("donorId", "displayName email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("Error fetching items by subcategory:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};
