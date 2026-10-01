const styles = {
  available: "bg-green-100 text-green-700",
  assigned: "bg-blue-100 text-blue-700",
  maintenance: "bg-amber-100 text-amber-700",
  retired: "bg-slate-200 text-slate-600",
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-200 text-slate-600",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}