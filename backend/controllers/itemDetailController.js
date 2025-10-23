import Item from "../models/items.js";
import User from "../models/users.js";

// Controller to get a single item's details
export const getItemDetails = async (req, res) => {
    try {
        const itemId = req.params.id;

        // Fetch the item, explicitly populating referenced fields (categoryId, donorId)
        const item = await Item.findById(itemId)
            .populate("donorId", "displayName email contactPreference phoneNumber")
            .populate("categoryId", "name")
            .select("name description imageURL price donorId categoryId subcategory pickup")
            .exec(); // Execute the query

        if (!item) {
            return res.status(404).render("404", { message: "Item not found." });
        }

        // --- 1. Prepare Donor Information ---
        const donor = item.donorId;
        // Check if donor is populated. If not, this item might be corrupted.
        if (!donor) {
             // Handle case where donorId exists but points to a non-existent user
             console.warn(`Item ${itemId} has missing donor data.`);
             return res.status(404).render("404", { message: "Item's donor is unavailable." });
        }
        
        const donorEmail = donor.email; 
        const donorName = donor.displayName || 'Anonymous Donor'; 

        // --- 2. Prepare Contact Information for the Frontend ---
        let contactInfo = null;
        let contactNote = '';

        switch (donor.contactPreference) {
            case 'phone':
                contactInfo = { 
                    type: 'Phone', 
                    value: donor.phoneNumber || 'Not provided', 
                    donorEmail: donorEmail, 
                    donorName: donorName
                };
                break;
            case 'email':
                contactInfo = { 
                    type: 'Email', 
                    value: donorEmail, 
                    donorEmail: donorEmail, 
                    donorName: donorName
                };
                break;
            case 'inPerson':
                contactNote = 'Donor prefers meeting in person. Please use email to arrange a pickup location.';
                contactInfo = { 
                    type: 'Email', 
                    value: donorEmail, 
                    donorEmail: donorEmail, 
                    donorName: donorName,
                    note: contactNote
                };
                break;
            default:
                // Default to email if preference is missing or invalid
                contactInfo = { 
                    type: 'Email', 
                    value: donorEmail, 
                    donorEmail: donorEmail, 
                    donorName: donorName
                };
        }
        
        // --- 3. Prepare Item Details for the Frontend ---
        const itemForView = {
            // Converts Mongoose document to a plain object to include all properties
            ...item.toObject(), 
            // Flatten category name for easy access (though EJS can use item.categoryId.name too)
            categoryName: item.categoryId ? item.categoryId.name : 'N/A',
            // Pass the direct 'subcategory' string as subCategoryName for EJS access
            subCategoryName: item.subcategory || null, 
            donorName: donorName,
        };
        
        // Render the view with the required data
        res.render("itemDetail", {
            item: itemForView,
            contactInfo: contactInfo,
        });

    } catch (error) {
        console.error("Error fetching item details:", error);
        // Fallback response for internal server errors
        res.status(500).send("An error occurred while loading item details. Please try again.");
    }
};
