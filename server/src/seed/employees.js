import "dotenv/config";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";

const first = ["Aarav", "Emma", "Liam", "Sneha", "Noah", "Diya", "Oliver", "Meera",
  "Lucas", "Isha", "Ethan", "Zara", "Mason", "Anaya", "Leo"];
const last = ["Sen", "Brown", "Khan", "Silva", "Roy", "Miller", "Das"];
const departments = ["IT", "HR", "Finance", "Operations", "Sales", "Marketing", "Administration"];
const designations = ["Associate", "Analyst", "Engineer", "Manager", "Executive"];

await mongoose.connect(process.env.MONGO_URI);

// Only removes previously seeded records (example.com emails), never real data
await Employee.deleteMany({ email: /@example\.com$/ });

const employees = first.map((f, i) => {
  const l = last[i % last.length];
  return {
    employeeId: `EMP-${String(i + 1).padStart(3, "0")}`,
    name: `${f} ${l}`,
    email: `${f}.${l}${i + 1}@example.com`.toLowerCase(),
    department: departments[i % departments.length],
    designation: designations[i % designations.length],
    status: i % 6 === 5 ? "inactive" : "active",
  };
});

await Employee.insertMany(employees);
console.log(`Seeded ${employees.length} employees`);
await mongoose.disconnect();