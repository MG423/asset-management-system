import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import MaintenanceForm from "../components/MaintenanceForm";
import MaintenanceComplete from "../components/MaintenanceComplete";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function Maintenance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // undefined = form closed, null = adding new, object = editing that record
  const [formRecord, setFormRecord] = useState(undefined);
  const [completeRecord, setCompleteRecord] = useState(null);

  const debouncedSearch = useDebounce(search);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/maintenance", {
        params: { q: debouncedSearch, status, page, limit: 10 },
      });
      setRecords(data.records);
      setPagination({ pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load maintenance records");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete the record for ${r.asset?.assetTag} (${r.issue})?`)) return;
    try {
      await api.delete(`/maintenance/${r._id}`);
      if (records.length === 1 && page > 1) setPage(page - 1);
      else fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSaved = () => {
    setFormRecord(undefined);
    setCompleteRecord(null);
    fetchRecords();
  };

  const selectClass = "rounded border border-slate-300 bg-white px-3 py-2";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Maintenance</h2>
        <button onClick={() => setFormRecord(null)}
          className="rounded bg-slate-900 px-4 py-2 text-white">
          + Send for maintenance
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={onFilter(setSearch)}
          placeholder="Search asset, issue, or vendor..."
          className="w-72 rounded border border-slate-300 px-3 py-2"
        />
        <select value={status} onChange={onFilter(setStatus)} className={`${selectClass} capitalize`}>
          <option value="">All statuses</option>
          <option value="open">open</option>
          <option value="completed">completed</option>
        </select>
      </div>

      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {!loading && records.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No maintenance records found</td></tr>
            )}
            {!loading && records.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <span className="font-medium">{r.asset?.assetTag}</span>
                  <span className="text-slate-500"> - {r.asset?.name}</span>
                </td>
                <td className="px-4 py-3">{r.issue}</td>
                <td className="px-4 py-3">{r.vendor || "-"}</td>
                <td className="px-4 py-3">{formatDate(r.startDate)}</td>
                <td className="px-4 py-3">{formatDate(r.endDate)}</td>
                <td className="px-4 py-3">{r.cost != null ? r.cost.toLocaleString() : "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="space-x-3 px-4 py-3">
                  <button onClick={() => setFormRecord(r)} className="text-blue-600">Edit</button>
                  {r.status === "open" && (
                    <button onClick={() => setCompleteRecord(r)} className="text-green-700">
                      Complete
                    </button>
                  )}
                  {r.status === "completed" && user.role === "admin" && (
                    <button onClick={() => handleDelete(r)} className="text-red-600">Delete</button>
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
        label="records"
        onChange={setPage}
      />

      {formRecord !== undefined && (
        <MaintenanceForm
          record={formRecord}
          onClose={() => setFormRecord(undefined)}
          onSaved={handleSaved}
        />
      )}
      {completeRecord && (
        <MaintenanceComplete
          record={completeRecord}
          onClose={() => setCompleteRecord(null)}
          onDone={handleSaved}
        />
      )}
    </div>
  );
}