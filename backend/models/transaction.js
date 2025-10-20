import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "items",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "completed", "cancelled"],
      default: "initiated",
    },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ["free", "paid"], required: true },
    amount: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema,
  "transactions"
);
export default Transaction;
