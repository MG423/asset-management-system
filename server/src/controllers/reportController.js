import Asset from "../models/Asset.js";
import Assignment from "../models/Assignment.js";
import Employee from "../models/Employee.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";

const ROW_LIMIT = 5000;

// Turns "YYYY-MM-DD" from/to values into a MongoDB date range (either side optional)
const parseRange = (res, from, to) => {
  const range = {};
  if (from) range.$gte = new Date(`${from}T00:00:00.000Z`);
  if (to) range.$lte = new Date(`${to}T23:59:59.999Z`);

  for (const date of Object.values(range)) {
    if (Number.isNaN(date.getTime())) {
      res.status(400);
      throw new Error("Invalid date");
    }
  }
  return Object.keys(range).length ? range : null;
};

export const assetsReport = async (req, res) => {
  const { status, category } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const [rows, totals] = await Promise.all([
    Asset.find(filter).sort({ assetTag: 1 }).limit(ROW_LIMIT).lean(),
    Asset.aggregate([
      { $match: filter },
      { $group: { _id: null, count: { $sum: 1 }, totalValue: { $sum: "$cost" } } },
    ]),
  ]);

  const summary = {
    count: totals[0]?.count ?? 0,
    totalValue: totals[0]?.totalValue ?? 0,
  };
  res.json({ rows, summary, truncated: summary.count > ROW_LIMIT });
};

export const assignmentsReport = async (req, res) => {
  const { department, status, from, to } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const range = parseRange(res, from, to);
  if (range) filter.assignedDate = range;

  if (department) {
    const employees = await Employee.find({ department }).select("_id");
    filter.employee = { $in: employees.map((e) => e._id) };
  }

  const [assignments, count] = await Promise.all([
    Assignment.find(filter)
      .sort({ assignedDate: -1 })
      .limit(ROW_LIMIT)
      .populate("asset", "assetTag name category")
      .populate("employee", "employeeId name department"),
    Assignment.countDocuments(filter),
  ]);

  const rows = assignments.map((a) => ({
    id: a._id,
    assetTag: a.asset?.assetTag,
    assetName: a.asset?.name,
    category: a.asset?.category,
    employeeId: a.employee?.employeeId,
    employee: a.employee?.name,
    department: a.employee?.department,
    assignedDate: a.assignedDate,
    returnDate: a.returnDate,
    status: a.status,
  }));

  res.json({ rows, summary: { count }, truncated: count > ROW_LIMIT });
};

export const maintenanceReport = async (req, res) => {
  const { status, from, to } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const range = parseRange(res, from, to);
  if (range) filter.startDate = range;

  const [records, totals] = await Promise.all([
    MaintenanceRecord.find(filter)
      .sort({ startDate: -1 })
      .limit(ROW_LIMIT)
      .populate("asset", "assetTag name category"),
    MaintenanceRecord.aggregate([
      { $match: filter },
      { $group: { _id: null, count: { $sum: 1 }, totalCost: { $sum: "$cost" } } },
    ]),
  ]);

  const rows = records.map((r) => ({
    id: r._id,
    assetTag: r.asset?.assetTag,
    assetName: r.asset?.name,
    category: r.asset?.category,
    issue: r.issue,
    vendor: r.vendor,
    startDate: r.startDate,
    endDate: r.endDate,
    cost: r.cost,
    status: r.status,
  }));

  const summary = {
    count: totals[0]?.count ?? 0,
    totalCost: totals[0]?.totalCost ?? 0,
  };
  res.json({ rows, summary, truncated: summary.count > ROW_LIMIT });
};