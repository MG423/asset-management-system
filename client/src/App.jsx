import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("server unreachable"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Asset Management System</h1>
        <p className="mt-2 text-slate-600">API status: {status}</p>
      </div>
    </div>
  );
}