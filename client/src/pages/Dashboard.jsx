import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import { timeAgo } from "../utils/timeAgo";

const CARDS = [
  { key: "total", label: "Total Assets", color: "border-slate-500" },
  { key: "assigned", label: "Assigned", color: "border-blue-500" },
  { key: "available", label: "Available", color: "border-green-500" },
  { key: "maintenance", label: "Maintenance", color: "border-amber-500" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("category");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  if (error) {
    return <p className="rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>;
  }
  if (!data) return <p className="text-slate-500">Loading...</p>;

  const { stats, distribution, activity } = data;
  const tabClass = (active) =>
    `rounded px-3 py-1 text-sm ${
      active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
    }`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className={`rounded-lg border-l-4 bg-white p-5 shadow ${c.color}`}>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{stats[c.key].toLocaleString()}</p>
            {c.key === "total" && (
              <p className="mt-1 text-xs text-slate-400">includes {stats.retired} retired</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Asset Distribution</h3>
          <div className="flex gap-2">
            <button onClick={() => setView("category")} className={tabClass(view === "category")}>
              By category
            </button>
            <button onClick={() => setView("status")} className={tabClass(view === "status")}>
              By status
            </button>
          </div>
        </div>

        {stats.total === 0 ? (
          <p className="text-sm text-slate-500">No assets yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distribution[view]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Assets" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg bg-white p-5 shadow">
        <h3 className="mb-3 font-semibold">Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-500">No recent activity yet</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activity.map((a) => (
              <li key={a._id} className="flex items-center justify-between py-2 text-sm">
                <span>• {a.message}</span>
                <span className="text-slate-400">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}