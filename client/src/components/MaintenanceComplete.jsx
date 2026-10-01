import { useState } from "react";
import api from "../api/axios";

const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function MaintenanceComplete({ record, onClose, onDone }) {
  const [cost, setCost] = useState(record.cost ?? "");
  const [outcome, setOutcome] = useState("available");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch(`/maintenance/${record._id}/complete`, {
        cost: cost === "" ? null : Number(cost),
        outcome,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete record");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">Complete maintenance</h2>
        <p className="text-sm text-slate-600">
          {record.asset?.assetTag} - {record.issue}
        </p>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div>
          <label className={labelClass}>Final cost</label>
          <input type="number" min="0" value={cost}
            onChange={(e) => setCost(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Asset status afterwards</label>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)}
            className={inputClass}>
            <option value="available">Available (repaired)</option>
            <option value="retired">Retired (beyond repair)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2">
            Cancel
          </button>
          <button disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving..." : "Complete"}
          </button>
        </div>
      </form>
    </div>
  );
}