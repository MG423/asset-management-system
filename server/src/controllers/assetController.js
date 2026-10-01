import Asset from "../models/Asset.js";
import Assignment from "../models/Assignment.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";
import { pickFields, escapeRegex } from "../utils/queryHelpers.js";

const FIELDS = [
  "assetTag", "name", "category", "serialNumber",
  "purchaseDate", "cost", "status", "notes",
];

const notFoundError = (res) => {
  res.status(404);
  return new Error("Asset not found");
};

   // Statuses controlled by other modules, never set by hand
const MANAGED = new Map([
     ["assigned", {
       page: "Assignments",
       hasOpen: (id) => Assignment.exists({ asset: id, status: "active" }),
     }],
     ["maintenance", {
       page: "Maintenance",
       hasOpen: (id) => MaintenanceRecord.exists({ asset: id, status: "open" }),
     }],
   ]);

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
  const managed = MANAGED.get(data.status);
  if (managed) {
    res.status(400);
    throw new Error(`To set this status, use the ${managed.page} page`);
  }
    const asset = await Asset.create(data);
    await logActivity("asset_added", `${asset.category} ${asset.assetTag} added`, req.user._id);
    res.status(201).json({ asset });
};

export const updateAsset = async (req, res) => {
  const data = pickFields(req.body, FIELDS);
  const current = await Asset.findById(req.params.id);
  if (!current) throw notFoundError(res);

  if (data.status && data.status !== current.status) {
    const entering = MANAGED.get(data.status);
    if (entering) {
      res.status(400);
      throw new Error(`To set this status, use the ${entering.page} page`);
    }
    const leaving = MANAGED.get(current.status);
    if (leaving && (await leaving.hasOpen(current._id))) {
      res.status(400);
      throw new Error(
        `This asset's status is managed on the ${leaving.page} page. Finish it there first`
      );
    }
  }

  const asset = await Asset.findByIdAndUpdate(current._id, data, {
    new: true,
    runValidators: true,
  });
  res.json({ asset });
};

export const deleteAsset = async (req, res) => {
  const [hasAssignments, hasMaintenance] = await Promise.all([
    Assignment.exists({ asset: req.params.id }),
    MaintenanceRecord.exists({ asset: req.params.id }),
  ]);
  if (hasAssignments || hasMaintenance) {
    res.status(400);
    throw new Error(
      "This asset has assignment or maintenance history and can't be deleted. Mark it as retired instead"
    );
  }
    const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) throw notFoundError(res);
  await logActivity("asset_deleted", `${asset.category} ${asset.assetTag} deleted`, req.user._id);
  res.json({ message: "Asset deleted" });
};