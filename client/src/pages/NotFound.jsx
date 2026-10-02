import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-600">Page not found</p>
      <Link to="/" className="text-blue-600">Back to dashboard</Link>
    </div>
  );
}