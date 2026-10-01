export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Keep only the allowed fields from a request body
export const pickFields = (body, fields) =>
  Object.fromEntries(
    fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]])
  );