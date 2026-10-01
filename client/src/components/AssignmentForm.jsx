import { useEffect, useState } from "react";
import api from "../api/axios";

const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function AssignmentForm({ onClose, onSaved }) {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ asset: "", employee: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/assets", { params: { status: "available", limit: 100 } }),
      api.get("/employees", { params: { status: "active", limit: 100 } }),
    ])
      .then(([a, e]) => {
        setAssets(a.data.assets);
        setEmployees(e.data.employees);
      })
      .catch(() => setError("Failed to load assets and employees"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/assignments", form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign asset");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">Assign asset</h2>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div>
          <label className={labelClass}>Asset (available only) *</label>
          <select name="asset" value={form.asset} onChange={handleChange}
            className={inputClass} required disabled={loading}>
            <option value="">{loading ? "Loading..." : "Select an asset"}</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>{a.assetTag} - {a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Employee (active only) *</label>
          <select name="employee" value={form.employee} onChange={handleChange}
            className={inputClass} required disabled={loading}>
            <option value="">{loading ? "Loading..." : "Select an employee"}</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>{emp.employeeId} - {emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            rows={2} className={inputClass} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2">
            Cancel
          </button>
          <button disabled={saving || loading}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
      </form>
    </div>
  );
}