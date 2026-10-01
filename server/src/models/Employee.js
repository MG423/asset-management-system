import mongoose from "mongoose";

export const DEPARTMENTS = [
  "IT", "HR", "Finance", "Operations", "Sales", "Marketing", "Administration", "Other",
];
export const EMPLOYEE_STATUSES = ["active", "inactive"];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: { values: DEPARTMENTS, message: "Invalid department" },
    },
    designation: { type: String, trim: true },
    status: {
      type: String,
      enum: { values: EMPLOYEE_STATUSES, message: "Invalid status" },
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);