import "dotenv/config";
import mongoose from "mongoose";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import Assignment from "../models/Assignment.js";

await mongoose.connect(process.env.MONGO_URI);

// Only removes previously seeded records
await Assignment.deleteMany({ notes: "seed" });

const employees = await Employee.find({ email: /@example\.com$/, status: "active" });
const assignedAssets = await Asset.find({ notes: "seed", status: "assigned" });
const availableAssets = await Asset.find({ notes: "seed", status: "available" }).limit(4);

if (employees.length === 0 || assignedAssets.length === 0) {
  console.log("Run the assets and employees seeds first, then try again");
  await mongoose.disconnect();
  process.exit(1);
}

const day = 24 * 60 * 60 * 1000;

const active = assignedAssets.map((asset, i) => ({
  asset: asset._id,
  employee: employees[i % employees.length]._id,
  assignedDate: new Date(Date.now() - (i + 1) * 5 * day),
  status: "active",
  notes: "seed",
}));

const returned = availableAssets.map((asset, i) => ({
  asset: asset._id,
  employee: employees[(i + 3) % employees.length]._id,
  assignedDate: new Date(Date.now() - (30 + i * 7) * day),
  returnDate: new Date(Date.now() - (10 + i * 3) * day),
  status: "returned",
  notes: "seed",
}));

await Assignment.insertMany([...active, ...returned]);
console.log(`Seeded ${active.length} active and ${returned.length} returned assignments`);
await mongoose.disconnect();