import mongoose from "mongoose";

export const ASSET_CATEGORIES = [
  "Laptop", "Desktop", "Monitor", "Printer", "Phone", "Furniture", "Other",
];
export const ASSET_STATUSES = ["available", "assigned", "maintenance", "retired"];

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, "Asset tag is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: [true, "Name is required"], trim: true },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: { values: ASSET_CATEGORIES, message: "Invalid category" },
    },
    serialNumber: { type: String, trim: true },
    purchaseDate: { type: Date },
    cost: { type: Number, min: [0, "Cost cannot be negative"] },
    status: {
      type: String,
      enum: { values: ASSET_STATUSES, message: "Invalid status" },
      default: "available",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);