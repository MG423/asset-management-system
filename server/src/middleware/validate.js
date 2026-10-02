// Checks req.body against a Zod schema and replaces it with the cleaned result
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    res.status(400);
    throw new Error(
      result.error.issues
        .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
        .join(", ")
    );
  }

  req.body = result.data;
  next();
};