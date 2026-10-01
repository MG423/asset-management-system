import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import AssignmentForm from "../components/AssignmentForm";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/assignments", {
        params: { q: debouncedSearch, status, page, limit: 10 },
      });
      setAssignments(data.assignments);
      setPagination({ pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleReturn = async (a) => {
    const label = `${a.asset?.assetTag} from ${a.employee?.name}`;
    if (!window.confirm(`Mark ${label} as returned?`)) return;
    try {
      await api.patch(`/assignments/${a._id}/return`);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Return failed");
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    fetchAssignments();
  };

  const selectClass = "rounded border border-slate-300 bg-white px-3 py-2";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <button onClick={() => setShowForm(true)}
          className="rounded bg-slate-900 px-4 py-2 text-white">
          + Assign asset
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={onFilter(setSearch)}
          placeholder="Search asset or employee..."
          className="w-72 rounded border border-slate-300 px-3 py-2"
        />
        <select value={status} onChange={onFilter(setStatus)} className={`${selectClass} capitalize`}>
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="returned">returned</option>
        </select>
      </div>

      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Returned</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No assignments found</td></tr>
            )}
            {!loading && assignments.map((a) => (
              <tr key={a._id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <span className="font-medium">{a.asset?.assetTag}</span>
                  <span className="text-slate-500"> - {a.asset?.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{a.employee?.employeeId}</span>
                  <span className="text-slate-500"> - {a.employee?.name}</span>
                </td>
                <td className="px-4 py-3">{formatDate(a.assignedDate)}</td>
                <td className="px-4 py-3">{formatDate(a.returnDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  {a.status === "active" && (
                    <button onClick={() => handleReturn(a)} className="text-blue-600">
                      Return
                    </button>
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
        label="assignments"
        onChange={setPage}
      />

      {showForm && <AssignmentForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
}