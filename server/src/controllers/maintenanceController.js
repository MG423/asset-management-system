import MaintenanceRecord from "../models/MaintenanceRecord.js";
import Asset from "../models/Asset.js";
import { pickFields, escapeRegex } from "../utils/queryHelpers.js";
import { logActivity } from "../utils/logActivity.js";

const CREATE_FIELDS = ["asset", "issue", "vendor", "cost", "startDate", "notes"];
const UPDATE_FIELDS = ["issue", "vendor", "cost", "startDate", "notes"];

const populateFields = [{ path: "asset", select: "assetTag name category" }];

const notFoundError = (res) => {
  res.status(404);
  return new Error("Maintenance record not found");
};

export const getRecords = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const { q, status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  // Search by asset (tag/name), issue, or vendor
  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(escapeRegex(q.trim()), "i");
    const assets = await Asset.find({
      $or: [{ name: regex }, { assetTag: regex }],
    }).select("_id");
    filter.$or = [
      { issue: regex },
      { vendor: regex },
      { asset: { $in: assets.map((a) => a._id) } },
    ];
  }

  const total = await MaintenanceRecord.countDocuments(filter);
  const records = await MaintenanceRecord.find(filter)
    .sort({ startDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(populateFields);

  res.json({ records, page, pages: Math.ceil(total / limit), total });
};

export const createRecord = async (req, res) => {
  const data = pickFields(req.body, CREATE_FIELDS);

  if (!data.asset) {
    res.status(400);
    throw new Error("Asset is required");
  }

  // Claim the asset in one atomic step: only works if it is still available
  const asset = await Asset.findOneAndUpdate(
    { _id: data.asset, status: "available" },
    { status: "maintenance" },
    { new: true }
  );
  if (!asset) {
    const existing = await Asset.findById(data.asset).select("status");
    if (!existing) {
      res.status(404);
      throw new Error("Asset not found");
    }
    res.status(400);
    throw new Error(`Asset is ${existing.status}. Only available assets can be sent for maintenance`);
  }

  try {
    const record = await MaintenanceRecord.create({
      ...data,
      asset: asset._id,
      createdBy: req.user._id,
    });
        await record.populate(populateFields);
    await logActivity(
      "maintenance_started",
      `${asset.category} ${asset.assetTag} sent for maintenance`,
      req.user._id
    );
    res.status(201).json({ record });
  } catch (err) {
    // Undo the status change if saving the record failed
    await Asset.updateOne({ _id: asset._id }, { status: "available" });
    throw err;
  }
};

export const updateRecord = async (req, res) => {
  const record = await MaintenanceRecord.findByIdAndUpdate(
    req.params.id,
    pickFields(req.body, UPDATE_FIELDS),
    { new: true, runValidators: true }
  ).populate(populateFields);
  if (!record) throw notFoundError(res);
  res.json({ record });
};

export const completeRecord = async (req, res) => {
  const { cost, outcome = "available" } = req.body;

  if (!["available", "retired"].includes(outcome)) {
    res.status(400);
    throw new Error("Outcome must be available or retired");
  }

  const update = { status: "completed", endDate: new Date() };
  if (cost !== undefined && cost !== null && cost !== "") update.cost = cost;

  // Only an open record can be completed
  const record = await MaintenanceRecord.findOneAndUpdate(
    { _id: req.params.id, status: "open" },
    update,
    { new: true, runValidators: true }
  );
  if (!record) {
    const exists = await MaintenanceRecord.exists({ _id: req.params.id });
    res.status(exists ? 400 : 404);
    throw new Error(exists ? "Record is already completed" : "Maintenance record not found");
  }

  await Asset.updateOne(
    { _id: record.asset, status: "maintenance" },
    { status: outcome }
  );

    await record.populate(populateFields);
  const label = `${record.asset?.category} ${record.asset?.assetTag}`;
  await logActivity(
    "maintenance_completed",
    outcome === "retired"
      ? `${label} maintenance completed, asset retired`
      : `${label} maintenance completed`,
    req.user._id
  );
  res.json({ record });
};

export const deleteRecord = async (req, res) => {
  const record = await MaintenanceRecord.findById(req.params.id);
  if (!record) throw notFoundError(res);
  if (record.status === "open") {
    res.status(400);
    throw new Error("Complete this record before deleting it");
  }
  await record.deleteOne();
  res.json({ message: "Maintenance record deleted" });
};