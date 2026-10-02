import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import StatusBadge from "./StatusBadge";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounce(query.trim());

  useEffect(() => {
    if (debounced.length < 2) {
      setResults(null);
      return;
    }
    let ignore = false;
    api
      .get("/search", { params: { q: debounced } })
      .then((res) => {
        if (!ignore) setResults(res.data);
      })
      .catch(() => {
        if (!ignore) setResults(null);
      });
    return () => {
      ignore = true;
    };
  }, [debounced]);

  // Close the dropdown when clicking elsewhere
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (path, term) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    navigate(`${path}?q=${encodeURIComponent(term)}`);
  };

  const showDropdown = open && query.trim().length >= 2 && results;
  const empty = results && results.assets.length === 0 && results.employees.length === 0;
  const heading = "px-3 pt-2 pb-1 text-xs font-semibold uppercase text-slate-400";
  const item = "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100";

  return (
    <div ref={boxRef} className="relative w-72">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search assets and employees..."
        className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded bg-white shadow-lg">
          {empty && <p className="px-3 py-3 text-sm text-slate-500">No results</p>}

          {results.assets.length > 0 && (
            <>
              <p className={heading}>Assets</p>
              {results.assets.map((a) => (
                <button key={a._id} onClick={() => go("/assets", a.assetTag)} className={item}>
                  <span>{a.assetTag} - {a.name}</span>
                  <StatusBadge status={a.status} />
                </button>
              ))}
            </>
          )}

          {results.employees.length > 0 && (
            <>
              <p className={heading}>Employees</p>
              {results.employees.map((e) => (
                <button key={e._id} onClick={() => go("/employees", e.employeeId)} className={item}>
                  <span>{e.employeeId} - {e.name}</span>
                  <span className="text-xs text-slate-400">{e.department}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}