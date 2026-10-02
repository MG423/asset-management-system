import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GlobalSearch from "./GlobalSearch";

export const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Assets", to: "/assets" },
  { label: "Employees", to: "/employees" },
  { label: "Assignments", to: "/assignments" },
  { label: "Maintenance", to: "/maintenance" },
  { label: "Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-56 bg-slate-900 p-4 text-slate-200">
        <h1 className="mb-6 text-lg font-bold text-white">Asset Management</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${
                  isActive ? "bg-slate-700 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between bg-white px-6 py-3 shadow">
          <span className="font-semibold">Asset Management System</span>
          <GlobalSearch />
          <div className="flex items-center gap-4">
            <span>👤 {user.name}</span>
            <button
              onClick={logout}
              className="rounded bg-slate-800 px-3 py-1 text-sm text-white"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}