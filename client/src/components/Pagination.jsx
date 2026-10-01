export default function Pagination({ page, pages, total, label, onChange }) {
  const btn = "rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-40";
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>{total} {label}</span>
      <div className="flex items-center gap-3">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className={btn}>
          Previous
        </button>
        <span>Page {page} of {Math.max(pages, 1)}</span>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className={btn}>
          Next
        </button>
      </div>
    </div>
  );
}