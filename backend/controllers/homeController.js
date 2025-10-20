import Item from "../models/items.js";

const ESSENTIAL_FILTER = {
  name: { $exists: true, $ne: "" },
  description: { $exists: true, $ne: "" },
};

export const getHomePage = async (req, res) => {
  try {
    const frequentItems = await Item.find(ESSENTIAL_FILTER)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("donorId", "displayName email")
      .populate("categoryId", "name")
      .select("name description imageURL donorId categoryId createdAt")
      .exec();

    console.log(`[HOMEPAGE DEBUG] Items Found: ${frequentItems.length}`);

    if (frequentItems.length > 0) {
      console.log(
        `[HOMEPAGE DEBUG] Latest Item Name: ${frequentItems[0].name}`
      );
    }

    res.render("home", {
      frequentItems: frequentItems,
    });
  } catch (error) {
    console.error("Error fetching essential items for homepage:", error);
    res.render("home", {
      frequentItems: [],
    });
  }
};
