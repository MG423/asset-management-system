import Asset from "../models/Asset.js";
import Assignment from "../models/Assignment.js";
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
  const data = pickFields(req.body, FIELDS);
  if (data.status === "assigned") {
    res.status(400);
    throw new Error("To assign an asset, use the Assignments page");
  }
  const asset = await Asset.create(data);
  res.status(201).json({ asset });
};

export const updateAsset = async (req, res) => {
  const data = pickFields(req.body, FIELDS);
  const current = await Asset.findById(req.params.id);
  if (!current) throw notFoundError(res);

  if (data.status && data.status !== current.status) {
    if (data.status === "assigned") {
      res.status(400);
      throw new Error("To assign an asset, use the Assignments page");
    }
    if (
      current.status === "assigned" &&
      (await Assignment.exists({ asset: current._id, status: "active" }))
    ) {
      res.status(400);
      throw new Error("This asset is currently assigned. Return it from the Assignments page first");
    }
  }

  const asset = await Asset.findByIdAndUpdate(current._id, data, {
    new: true,
    runValidators: true,
  });
  res.json({ asset });
};

export const deleteAsset = async (req, res) => {
  if (await Assignment.exists({ asset: req.params.id })) {
    res.status(400);
    throw new Error("This asset has assignment history and can't be deleted. Mark it as retired instead");
  }
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) throw notFoundError(res);
  res.json({ message: "Asset deleted" });
};