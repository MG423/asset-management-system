export default function Notice({ notice }) {
  if (!notice) return null;
  const style =
    notice.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return <p className={`rounded px-3 py-2 text-sm ${style}`}>{notice.text}</p>;
}