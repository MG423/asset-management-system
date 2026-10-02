import { Fragment } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout, { navItems } from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import Placeholder from "./pages/Placeholder";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Employees from "./pages/Employees";
import Assignments from "./pages/Assignments";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  const { search } = useLocation();

  const pages = {
    "/": <Dashboard />,
    "/assets": <Assets />,
    "/employees": <Employees />,
    "/assignments": <Assignments />,
    "/maintenance": <Maintenance />,
    "/reports": <Reports />,
    "/settings": <Settings />,
  };

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
              element={
                <Fragment key={search}>
                  {pages[item.to] || <Placeholder title={item.label} />}
                </Fragment>
              }
            />
          ))}
        </Route>
      </Route>
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
}