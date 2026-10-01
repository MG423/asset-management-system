import mongoose from "mongoose";

export const ACTIVITY_TYPES = [
  "asset_added",
  "asset_deleted",
  "assigned",
  "returned",
  "maintenance_started",
  "maintenance_completed",
];

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ createdAt: -1 });

export default mongoose.model("Activity", activitySchema);