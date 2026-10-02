import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Notice from "../Notice";
import StatusBadge from "../StatusBadge";

const EMPTY = { name: "", email: "", password: "", role: "staff" };
const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to load users" });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const update = async (u, changes, successText) => {
    setNotice(null);
    try {
      await api.patch(`/users/${u.id}`, changes);
      setNotice({ type: "success", text: successText });
      fetchUsers();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Update failed" });
    }
  };

  const toggleActive = (u) => {
    if (u.active && !window.confirm(`Deactivate ${u.name}? They will not be able to log in.`)) {
      return;
    }
    update(u, { active: !u.active }, `${u.name} ${u.active ? "deactivated" : "activated"}`);
  };

  const resetPassword = (u) => {
    const password = window.prompt(`Enter a new password for ${u.name} (min 6 characters):`);
    if (password) update(u, { password }, `Password reset for ${u.name}`);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await api.post("/users", form);
      setForm(EMPTY);
      setShowForm(false);
      setNotice({ type: "success", text: "User created" });
      fetchUsers();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to create user" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">User management</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
          {showForm ? "Cancel" : "+ Add user"}
        </button>
      </div>

      <Notice notice={notice} />

      {showForm && (
        <form onSubmit={addUser} className="grid grid-cols-1 gap-3 rounded border border-slate-200 p-4 sm:grid-cols-2">
          <input name="name" placeholder="Name" value={form.name}
            onChange={handleChange} className={inputClass} required />
          <input name="email" type="email" placeholder="Email" value={form.email}
            onChange={handleChange} className={inputClass} required />
          <input name="password" type="password" placeholder="Temporary password (min 6)"
            value={form.password} onChange={handleChange} className={inputClass} required />
          <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
          <button disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50 sm:col-span-2">
            {saving ? "Creating..." : "Create user"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === me.id;
              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {u.name} {isMe && <span className="text-slate-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {isMe ? (
                      u.role
                    ) : (
                      <select value={u.role}
                        onChange={(e) => update(u, { role: e.target.value }, `${u.name} is now ${e.target.value}`)}
                        className="rounded border border-slate-300 px-2 py-1">
                        <option value="staff">staff</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.active ? "active" : "inactive"} />
                  </td>
                  <td className="space-x-3 px-4 py-3">
                    {!isMe && (
                      <>
                        <button onClick={() => toggleActive(u)} className="text-blue-600">
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => resetPassword(u)} className="text-slate-600">
                          Reset password
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}