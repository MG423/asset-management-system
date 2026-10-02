import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import { escapeRegex } from "../utils/queryHelpers.js";

export const globalSearch = async (req, res) => {
  const { q } = req.query;
  if (typeof q !== "string" || q.trim().length < 2) {
    return res.json({ assets: [], employees: [] });
  }

  const regex = new RegExp(escapeRegex(q.trim()), "i");

  const [assets, employees] = await Promise.all([
    Asset.find({ $or: [{ assetTag: regex }, { name: regex }, { serialNumber: regex }] })
      .select("assetTag name status")
      .sort({ assetTag: 1 })
      .limit(5),
    Employee.find({ $or: [{ employeeId: regex }, { name: regex }, { email: regex }] })
      .select("employeeId name department")
      .sort({ employeeId: 1 })
      .limit(5),
  ]);

  res.json({ assets, employees });
};