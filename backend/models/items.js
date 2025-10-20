  import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageURL: { type: [String], default: [] },

    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["available", "unavailable", "reserved"],
      default: "available",
    },

    pickup: { type: String, required: true },
    available_until: { type: Date },
    urgent: { type: Boolean, default: false },
    condition: {type: String, required: true},

preferences: { 
  type: [String], 
  required: true,       
  validate: {
    validator: (arr) => arr.length > 0,  
    message: "At least one preference is required"
  }
},
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",

      required: true,
    },
    subcategory: { type: String, required: true },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema, "items");
export default Item;
