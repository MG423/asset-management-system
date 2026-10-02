import { useState } from "react";
import api from "../../api/axios";
import Notice from "../Notice";

const EMPTY = { currentPassword: "", newPassword: "", confirm: "" };
const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function PasswordSection() {
  const [form, setForm] = useState(EMPTY);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);
    if (form.newPassword !== form.confirm) {
      setNotice({ type: "error", text: "New passwords do not match" });
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(EMPTY);
      setNotice({ type: "success", text: "Password updated" });
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow">
      <h3 className="font-semibold">Change password</h3>
      <Notice notice={notice} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Current password</label>
          <input name="currentPassword" type="password" value={form.currentPassword}
            onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>New password (min 6)</label>
          <input name="newPassword" type="password" value={form.newPassword}
            onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Confirm new password</label>
          <input name="confirm" type="password" value={form.confirm}
            onChange={handleChange} className={inputClass} required />
        </div>
      </div>
      <button disabled={saving}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}