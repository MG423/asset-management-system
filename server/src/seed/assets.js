import "dotenv/config";
import mongoose from "mongoose";
import Asset from "../models/Asset.js";
import Assignment from "../models/Assignment.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";

const categories = ["Laptop", "Desktop", "Monitor", "Printer", "Phone", "Furniture", "Other"];
const statuses = ["available", "assigned", "maintenance"];

await mongoose.connect(process.env.MONGO_URI);

   // Removes previously seeded assets and any records pointing at them
const oldIds = (await Asset.find({ notes: "seed" }).select("_id")).map((a) => a._id);
await Assignment.deleteMany({ asset: { $in: oldIds } });
await MaintenanceRecord.deleteMany({ asset: { $in: oldIds } });
await Asset.deleteMany({ _id: { $in: oldIds } });

const assets = Array.from({ length: 25 }, (_, i) => ({
  assetTag: `AST-${101 + i}`,
  name: `Sample ${categories[i % categories.length]} ${i + 1}`,
  category: categories[i % categories.length],
  serialNumber: `SN${100000 + i * 37}`,
  purchaseDate: new Date(2024, i % 12, 5 + (i % 20)),
  cost: 5000 + i * 1500,
  status: statuses[i % statuses.length],
  notes: "seed",
}));

await Asset.insertMany(assets);
console.log(`Seeded ${assets.length} assets`);
await mongoose.disconnect();