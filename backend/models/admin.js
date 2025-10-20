import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    activeRequest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema, "admin");
export default Admin;
