import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout, { navItems } from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import Placeholder from "./pages/Placeholder";
import Assets from "./pages/Assets";
import Employees from "./pages/Employees";
import Assignments from "./pages/Assignments";
import Maintenance from "./pages/Maintenance";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";

export default function App() {
  const pages = { "/assets": <Assets />, "/employees": <Employees />, "/assignments": <Assignments />, "/maintenance": <Maintenance />, "/reports": <Reports />, "/": <Dashboard /> };
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {navItems.map((item) => (
            <Route
              key={item.to}
              path={item.to}
              element={pages[item.to] || <Placeholder title={item.label} />}
            />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}