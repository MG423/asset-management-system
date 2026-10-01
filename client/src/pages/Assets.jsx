import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import AssetForm from "../components/AssetForm";
import StatusBadge from "../components/StatusBadge";
import { CATEGORIES, STATUSES } from "../constants/assets";
import Pagination from "../components/Pagination";

export default function Assets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // undefined = form closed, null = adding new, object = editing that asset
  const [formAsset, setFormAsset] = useState(undefined);

  const debouncedSearch = useDebounce(search);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/assets", {
        params: { q: debouncedSearch, status, category, page, limit: 10 },
      });
      setAssets(data.assets);
      setPagination({ pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, category, page]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Any filter change sends you back to page 1
  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete ${asset.assetTag} (${asset.name})?`)) return;
    try {
      await api.delete(`/assets/${asset._id}`);
      if (assets.length === 1 && page > 1) setPage(page - 1);
      else fetchAssets();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSaved = () => {
    setFormAsset(undefined);
    fetchAssets();
  };

  const selectClass = "rounded border border-slate-300 bg-white px-3 py-2";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assets</h2>
        <button onClick={() => setFormAsset(null)}
          className="rounded bg-slate-900 px-4 py-2 text-white">
          + Add asset
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={onFilter(setSearch)}
          placeholder="Search name, tag, or serial..."
          className="w-72 rounded border border-slate-300 px-3 py-2"
        />
        <select value={status} onChange={onFilter(setStatus)} className={`${selectClass} capitalize`}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={category} onChange={onFilter(setCategory)} className={selectClass}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Serial</th>
              <th className="px-4 py-3">Purchased</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {!loading && assets.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No assets found</td></tr>
            )}
            {!loading && assets.map((a) => (
              <tr key={a._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{a.assetTag}</td>
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3">{a.category}</td>
                <td className="px-4 py-3">{a.serialNumber || "-"}</td>
                <td className="px-4 py-3">
                  {a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3">{a.cost != null ? a.cost.toLocaleString() : "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="space-x-3 px-4 py-3">
                  <button onClick={() => setFormAsset(a)} className="text-blue-600">Edit</button>
                  {user.role === "admin" && (
                    <button onClick={() => handleDelete(a)} className="text-red-600">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
   <Pagination
     page={page}
     pages={pagination.pages}
     total={pagination.total}
     label="assets"
     onChange={setPage}
   />

      {formAsset !== undefined && (
        <AssetForm asset={formAsset} onClose={() => setFormAsset(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}