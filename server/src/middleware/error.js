export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message;

  if (err.code === 11000) {
    status = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  if (err.name === "CastError") {
    const isId = err.path === "_id" || err.kind === "ObjectId";
    status = isId ? 404 : 400;
    message = isId ? "Resource not found" : `Invalid value for ${err.path}`;
  }
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  }
  if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  }

  // Log real server errors; hide their details from users in production
  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Something went wrong on the server";
  }

  res.status(status).json({ message });
};