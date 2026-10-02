// Escapes one cell. Values starting with = + - @ get a leading apostrophe
// so spreadsheet apps can't run them as formulas.
const escapeCell = (value) => {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const csvValue = (row, col) => {
  const value = row[col.key];
  if (value == null) return "";
  if (col.type === "date") return new Date(value).toISOString().slice(0, 10);
  return value;
};

export function downloadCsv(filename, columns, rows) {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(csvValue(row, c))).join(",")
  );
  // The leading \uFEFF makes Excel read the file as UTF-8
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}