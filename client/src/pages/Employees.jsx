import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import EmployeeForm from "../components/EmployeeForm";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import { DEPARTMENTS, EMPLOYEE_STATUSES } from "../constants/employees";

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // undefined = form closed, null = adding new, object = editing that employee
  const [formEmployee, setFormEmployee] = useState(undefined);

  const debouncedSearch = useDebounce(search);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/employees", {
        params: { q: debouncedSearch, status, department, page, limit: 10 },
      });
      setEmployees(data.employees);
      setPagination({ pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, department, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Any filter change sends you back to page 1
  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.employeeId} (${emp.name})?`)) return;
    try {
      await api.delete(`/employees/${emp._id}`);
      if (employees.length === 1 && page > 1) setPage(page - 1);
      else fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSaved = () => {
    setFormEmployee(undefined);
    fetchEmployees();
  };

  const selectClass = "rounded border border-slate-300 bg-white px-3 py-2";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Employees</h2>
        <button onClick={() => setFormEmployee(null)}
          className="rounded bg-slate-900 px-4 py-2 text-white">
          + Add employee
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={onFilter(setSearch)}
          placeholder="Search name, email, or ID..."
          className="w-72 rounded border border-slate-300 px-3 py-2"
        />
        <select value={department} onChange={onFilter(setDepartment)} className={selectClass}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={onFilter(setStatus)} className={`${selectClass} capitalize`}>
          <option value="">All statuses</option>
          {EMPLOYEE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {!loading && employees.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No employees found</td></tr>
            )}
            {!loading && employees.map((emp) => (
              <tr key={emp._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{emp.employeeId}</td>
                <td className="px-4 py-3">{emp.name}</td>
                <td className="px-4 py-3">{emp.email}</td>
                <td className="px-4 py-3">{emp.department}</td>
                <td className="px-4 py-3">{emp.designation || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                <td className="space-x-3 px-4 py-3">
                  <button onClick={() => setFormEmployee(emp)} className="text-blue-600">Edit</button>
                  {user.role === "admin" && (
                    <button onClick={() => handleDelete(emp)} className="text-red-600">Delete</button>
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
        label="employees"
        onChange={setPage}
      />

      {formEmployee !== undefined && (
        <EmployeeForm
          employee={formEmployee}
          onClose={() => setFormEmployee(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}