import { useEffect, useState } from "react";
import api from "../api/axios";

const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

// Today's date as YYYY-MM-DD in local time
const today = () => new Date().toLocaleDateString("en-CA");

const toForm = (r) => ({
  asset: r?.asset?._id || "",
  issue: r?.issue || "",
  vendor: r?.vendor || "",
  cost: r?.cost ?? "",
  startDate: r?.startDate ? r.startDate.slice(0, 10) : today(),
  notes: r?.notes || "",
});

export default function MaintenanceForm({ record, onClose, onSaved }) {
  const isEdit = Boolean(record);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(toForm(record));
  const [loading, setLoading] = useState(!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) return;
    api
      .get("/assets", { params: { status: "available", limit: 100 } })
      .then((res) => setAssets(res.data.assets))
      .catch(() => setError("Failed to load assets"))
      .finally(() => setLoading(false));
  }, [isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, cost: form.cost === "" ? null : Number(form.cost) };
    try {
      if (isEdit) await api.put(`/maintenance/${record._id}`, payload);
      else await api.post("/maintenance", payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save record");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">
          {isEdit ? "Edit maintenance record" : "Send asset for maintenance"}
        </h2>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div>
          <label className={labelClass}>Asset {isEdit ? "" : "(available only) *"}</label>
          {isEdit ? (
            <p className="rounded bg-slate-100 px-3 py-2">
              {record.asset?.assetTag} - {record.asset?.name}
            </p>
          ) : (
            <select name="asset" value={form.asset} onChange={handleChange}
              className={inputClass} required disabled={loading}>
              <option value="">{loading ? "Loading..." : "Select an asset"}</option>
              {assets.map((a) => (
                <option key={a._id} value={a._id}>{a.assetTag} - {a.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelClass}>Issue *</label>
          <input name="issue" value={form.issue} onChange={handleChange}
            className={inputClass} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vendor</label>
            <input name="vendor" value={form.vendor} onChange={handleChange}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cost</label>
            <input name="cost" type="number" min="0" value={form.cost}
              onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Start date</label>
            <input name="startDate" type="date" value={form.startDate}
              onChange={handleChange} className={inputClass} />
          </div>
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
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}