import mongoose from "mongoose";

export const ASSIGNMENT_STATUSES = ["active", "returned"];

const assignmentSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    assignedDate: { type: Date, default: Date.now },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ASSIGNMENT_STATUSES, default: "active" },
    notes: { type: String, trim: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// An asset can have only ONE active assignment at a time
assignmentSchema.index(
  { asset: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export default mongoose.model("Assignment", assignmentSchema);