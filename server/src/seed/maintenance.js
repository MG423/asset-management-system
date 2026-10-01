import "dotenv/config";
import mongoose from "mongoose";
import Asset from "../models/Asset.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";

await mongoose.connect(process.env.MONGO_URI);

// Only removes previously seeded records
await MaintenanceRecord.deleteMany({ notes: "seed" });

const inMaintenance = await Asset.find({ notes: "seed", status: "maintenance" });
const available = await Asset.find({ notes: "seed", status: "available" }).limit(5);

if (inMaintenance.length === 0) {
  console.log("No sample assets in maintenance status. Run the assets seed first");
  await mongoose.disconnect();
  process.exit(1);
}

const issues = [
  "Screen flickering", "Battery not charging", "Paper jam recurring",
  "Keyboard keys not working", "Overheating", "Won't power on",
  "Network adapter failure", "Routine servicing",
];
const vendors = ["TechFix Services", "ServicePro", "QuickRepair Co"];
const day = 24 * 60 * 60 * 1000;

const open = inMaintenance.map((asset, i) => ({
  asset: asset._id,
  issue: issues[i % issues.length],
  vendor: vendors[i % vendors.length],
  startDate: new Date(Date.now() - (i + 1) * 3 * day),
  status: "open",
  notes: "seed",
}));

const completed = available.map((asset, i) => ({
  asset: asset._id,
  issue: issues[(i + 3) % issues.length],
  vendor: vendors[(i + 1) % vendors.length],
  cost: 500 + i * 750,
  startDate: new Date(Date.now() - (40 + i * 6) * day),
  endDate: new Date(Date.now() - (32 + i * 6) * day),
  status: "completed",
  notes: "seed",
}));

await MaintenanceRecord.insertMany([...open, ...completed]);
console.log(`Seeded ${open.length} open and ${completed.length} completed records`);
await mongoose.disconnect();