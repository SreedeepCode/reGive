import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "items",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    requestedAt: { type: Date, default: Date.now },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema, "requests");
export default Request;
