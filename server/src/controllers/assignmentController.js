import Assignment from "../models/Assignment.js";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import { escapeRegex } from "../utils/queryHelpers.js";
import { logActivity } from "../utils/logActivity.js";

const populateFields = [
  { path: "asset", select: "assetTag name category" },
  { path: "employee", select: "employeeId name department" },
];

export const getAssignments = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const { q, status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  // Search by asset (tag/name) or employee (ID/name)
  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(escapeRegex(q.trim()), "i");
    const [assets, employees] = await Promise.all([
      Asset.find({ $or: [{ name: regex }, { assetTag: regex }] }).select("_id"),
      Employee.find({ $or: [{ name: regex }, { employeeId: regex }] }).select("_id"),
    ]);
    filter.$or = [
      { asset: { $in: assets.map((a) => a._id) } },
      { employee: { $in: employees.map((e) => e._id) } },
    ];
  }

  const total = await Assignment.countDocuments(filter);
  const assignments = await Assignment.find(filter)
    .sort({ assignedDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(populateFields);

  res.json({ assignments, page, pages: Math.ceil(total / limit), total });
};

export const createAssignment = async (req, res) => {
  const { asset: assetId, employee: employeeId, notes } = req.body;

  if (!assetId || !employeeId) {
    res.status(400);
    throw new Error("Asset and employee are required");
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  if (employee.status !== "active") {
    res.status(400);
    throw new Error("Employee is inactive");
  }

  // Claim the asset in one atomic step: only works if it is still available
  const asset = await Asset.findOneAndUpdate(
    { _id: assetId, status: "available" },
    { status: "assigned" },
    { new: true }
  );
  if (!asset) {
    const exists = await Asset.exists({ _id: assetId });
    res.status(exists ? 400 : 404);
    throw new Error(exists ? "Asset is not available" : "Asset not found");
  }

  try {
    const assignment = await Assignment.create({
      asset: asset._id,
      employee: employee._id,
      notes,
      assignedBy: req.user._id,
    });
        await assignment.populate(populateFields);
    await logActivity(
      "assigned",
      `${asset.category} ${asset.assetTag} assigned to ${employee.name}`,
      req.user._id
    );
    res.status(201).json({ assignment });
  } catch (err) {
    // Undo the status change if saving the assignment failed
    await Asset.updateOne({ _id: asset._id }, { status: "available" });
    throw err;
  }
};

export const returnAssignment = async (req, res) => {
  // Only an active assignment can be returned
  const assignment = await Assignment.findOneAndUpdate(
    { _id: req.params.id, status: "active" },
    { status: "returned", returnDate: new Date() },
    { new: true }
  );
  if (!assignment) {
    const exists = await Assignment.exists({ _id: req.params.id });
    res.status(exists ? 400 : 404);
    throw new Error(exists ? "Assignment is already returned" : "Assignment not found");
  }

  await Asset.updateOne(
    { _id: assignment.asset, status: "assigned" },
    { status: "available" }
  );

    await assignment.populate(populateFields);
  await logActivity(
    "returned",
    `${assignment.asset?.category} ${assignment.asset?.assetTag} returned by ${assignment.employee?.name}`,
    req.user._id
  );
  res.json({ assignment });
};