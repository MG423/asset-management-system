import Asset from "../models/Asset.js";
import { pickFields, escapeRegex } from "../utils/queryHelpers.js";

const FIELDS = [
  "assetTag", "name", "category", "serialNumber",
  "purchaseDate", "cost", "status", "notes",
];

const notFoundError = (res) => {
  res.status(404);
  return new Error("Asset not found");
};

export const getAssets = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const { q, status, category } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ name: regex }, { assetTag: regex }, { serialNumber: regex }];
  }

  const total = await Asset.countDocuments(filter);
  const assets = await Asset.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ assets, page, pages: Math.ceil(total / limit), total });
};

export const getAsset = async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) throw notFoundError(res);
  res.json({ asset });
};

export const createAsset = async (req, res) => {
  const asset = await Asset.create(pickFields(req.body, FIELDS));
  res.status(201).json({ asset });
};

export const updateAsset = async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, pickFields(req.body, FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!asset) throw notFoundError(res);
  res.json({ asset });
};

export const deleteAsset = async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) throw notFoundError(res);
  res.json({ message: "Asset deleted" });
};