import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Notice from "../Notice";

const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function ProfileSection() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser(data.user);
      setNotice({ type: "success", text: "Profile updated" });
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow">
      <h3 className="font-semibold">Profile</h3>
      <Notice notice={notice} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" value={form.name} onChange={handleChange}
            className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className={inputClass} required />
        </div>
      </div>
      <p className="text-sm text-slate-500">Role: {user.role}</p>
      <button disabled={saving}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}