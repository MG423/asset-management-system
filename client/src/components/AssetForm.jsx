import { useState } from "react";
import api from "../api/axios";
import { CATEGORIES, STATUSES } from "../constants/assets";

const toForm = (a) => ({
  assetTag: a?.assetTag || "",
  name: a?.name || "",
  category: a?.category || CATEGORIES[0],
  serialNumber: a?.serialNumber || "",
  purchaseDate: a?.purchaseDate ? a.purchaseDate.slice(0, 10) : "",
  cost: a?.cost ?? "",
  status: a?.status || "available",
  notes: a?.notes || "",
});

const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function AssetForm({ asset, onClose, onSaved }) {
  const isEdit = Boolean(asset);
  const [form, setForm] = useState(toForm(asset));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      purchaseDate: form.purchaseDate || null,
      cost: form.cost === "" ? null : Number(form.cost),
    };

    try {
      if (isEdit) await api.put(`/assets/${asset._id}`, payload);
      else await api.post("/assets", payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save asset");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">{isEdit ? "Edit asset" : "Add asset"}</h2>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Asset tag *</label>
            <input name="assetTag" value={form.assetTag} onChange={handleChange}
              placeholder="AST-102" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className={`${inputClass} capitalize`}>
              {STATUSES.filter((s) => !["assigned", "maintenance"].includes(s) || asset?.status === s).map((s) => (<option key={s}>{s}</option>))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Serial number</label>
            <input name="serialNumber" value={form.serialNumber} onChange={handleChange}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Purchase date</label>
            <input name="purchaseDate" type="date" value={form.purchaseDate}
              onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cost</label>
            <input name="cost" type="number" min="0" value={form.cost}
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
          <button disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}