import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { user, login, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">{isLogin ? "Login" : "Create account"}</h1>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {!isLogin && (
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <button className="w-full rounded bg-slate-900 py-2 text-white">
          {isLogin ? "Login" : "Register"}
        </button>

        <p className="text-sm text-slate-600">
          {isLogin ? (
            "Need an account? Ask an administrator."
          ) : (
            <>
              Already registered?{" "}
              <Link to="/login" className="text-blue-600">Login</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}