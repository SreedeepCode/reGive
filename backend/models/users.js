import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  profile: { type: String, default: "" },
  points: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
  phone: { type: String },
  address: { type: String },
  setupComplete: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("users", userSchema, "users");
export default User;
