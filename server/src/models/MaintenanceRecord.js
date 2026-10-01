import mongoose from "mongoose";

export const MAINTENANCE_STATUSES = ["open", "completed"];

const maintenanceSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    issue: { type: String, required: [true, "Issue description is required"], trim: true },
    vendor: { type: String, trim: true },
    cost: { type: Number, min: [0, "Cost cannot be negative"] },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    status: { type: String, enum: MAINTENANCE_STATUSES, default: "open" },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// An asset can have only ONE open maintenance record at a time
maintenanceSchema.index(
  { asset: 1 },
  { unique: true, partialFilterExpression: { status: "open" } }
);

export default mongoose.model("MaintenanceRecord", maintenanceSchema);