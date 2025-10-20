import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Category = mongoose.model("category", categorySchema, "catalog");
export default Category;
