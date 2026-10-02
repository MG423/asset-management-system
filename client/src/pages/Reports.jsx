import { useEffect, useState } from "react";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import { REPORTS } from "../constants/reports";
import { downloadCsv } from "../utils/csv";

const PAGE_SIZE = 15;

const display = (row, col) => {
  const value = row[col.key];
  if (value == null || value === "") return "-";
  if (col.type === "date") return new Date(value).toLocaleDateString();
  if (col.type === "number") return value.toLocaleString();
  return value;
};

export default function Reports() {
  const [type, setType] = useState("assets");
  const [filters, setFilters] = useState({});
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const report = REPORTS[type];

  useEffect(() => {
    let ignore = false; // ignores responses that arrive after the user changed tabs/filters
    setLoading(true);
    setError("");

    api
      .get(report.endpoint, { params: filters })
      .then((res) => {
        if (ignore) return;
        setResult(res.data);
        setPage(1);
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.data?.message || "Failed to load report");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [report, filters]);

  const switchReport = (key) => {
    setType(key);
    setFilters({});
    setResult(null);
  };

  const handleExport = () => {
    const date = new Date().toLocaleDateString("en-CA");
    downloadCsv(`${type}-report-${date}.csv`, report.columns, result.rows);
  };

  const rows = result?.rows ?? [];
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const inputClass = "rounded border border-slate-300 bg-white px-3 py-2";

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Reports</h2>

      <div className="mb-4 flex gap-2">
        {Object.entries(REPORTS).map(([key, r]) => (
          <button
            key={key}
            onClick={() => switchReport(key)}
            className={`rounded px-4 py-2 text-sm ${
              type === key ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        {report.filters.map((f) => (
          <div key={f.name}>
            <label className="mb-1 block text-xs font-medium text-slate-600">{f.label}</label>
            {f.type === "date" ? (
              <input
                type="date"
                value={filters[f.name] || ""}
                onChange={(e) => setFilters({ ...filters, [f.name]: e.target.value })}
                className={inputClass}
              />
            ) : (
              <select
                value={filters[f.name] || ""}
                onChange={(e) => setFilters({ ...filters, [f.name]: e.target.value })}
                className={`${inputClass} capitalize`}
              >
                <option value="">All</option>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
          </div>
        ))}

        <button onClick={() => setFilters({})}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm">
          Clear filters
        </button>
        <button
          onClick={handleExport}
          disabled={!result || rows.length === 0}
          className="ml-auto rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}

      {result && (
        <div className="mb-4 flex flex-wrap gap-6 rounded-lg bg-white px-5 py-3 shadow">
          {report.summary(result.summary).map((line) => (
            <span key={line} className="font-medium">{line}</span>
          ))}
        </div>
      )}

      {result?.truncated && (
        <p className="mb-4 rounded bg-amber-100 px-3 py-2 text-sm text-amber-800">
          Showing the first 5,000 rows only. Narrow the filters to see the rest.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {report.columns.map((c) => (
                <th key={c.key} className="px-4 py-3">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={report.columns.length} className="px-4 py-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={report.columns.length} className="px-4 py-6 text-center text-slate-500">
                  No data for these filters
                </td>
              </tr>
            )}
            {!loading && pageRows.map((row, i) => (
              <tr key={row._id ?? row.id ?? i} className="border-t border-slate-100">
                {report.columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">{display(row, c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pages={Math.ceil(rows.length / PAGE_SIZE)}
        total={rows.length}
        label="rows"
        onChange={setPage}
      />
    </div>
  );
}