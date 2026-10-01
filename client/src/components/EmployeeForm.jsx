import { useState } from "react";
import api from "../api/axios";
import { DEPARTMENTS, EMPLOYEE_STATUSES } from "../constants/employees";

const toForm = (e) => ({
  employeeId: e?.employeeId || "",
  name: e?.name || "",
  email: e?.email || "",
  department: e?.department || DEPARTMENTS[0],
  designation: e?.designation || "",
  status: e?.status || "active",
});

const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function EmployeeForm({ employee, onClose, onSaved }) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState(toForm(employee));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) await api.put(`/employees/${employee._id}`, form);
      else await api.post("/employees", form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold">{isEdit ? "Edit employee" : "Add employee"}</h2>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Employee ID *</label>
            <input name="employeeId" value={form.employeeId} onChange={handleChange}
              placeholder="EMP-016" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className={inputClass} required />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Department *</label>
            <select name="department" value={form.department} onChange={handleChange}
              className={inputClass}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input name="designation" value={form.designation} onChange={handleChange}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className={`${inputClass} capitalize`}>
              {EMPLOYEE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
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