import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    SenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ReceiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

connectionSchema.index({ SenderId: 1, ReceiverId: 1 }, { unique: true });

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
