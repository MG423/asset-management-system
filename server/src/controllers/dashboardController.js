import Asset, { ASSET_STATUSES } from "../models/Asset.js";
import Activity from "../models/Activity.js";
import { logActivity } from "../utils/logActivity.js";

export const getDashboard = async (req, res) => {
  const [statusCounts, categoryCounts, activity] = await Promise.all([
    Asset.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Asset.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Activity.find().sort({ createdAt: -1 }).limit(8),
  ]);

  // Every status gets a number, even when it is 0
  const counts = Object.fromEntries(ASSET_STATUSES.map((s) => [s, 0]));
  statusCounts.forEach((s) => {
    counts[s._id] = s.count;
  });
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  res.json({
    stats: { total, ...counts },
    distribution: {
      category: categoryCounts.map((c) => ({ name: c._id, count: c.count })),
      status: ASSET_STATUSES.map((s) => ({
        name: s[0].toUpperCase() + s.slice(1),
        count: counts[s],
      })),
    },
    activity,
  });
};