import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// When deployed behind a proxy (Render, Nginx, etc.), also enable:
// app.set("trust proxy", 1);

const limiterOptions = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false };

// General limit for all API calls
const apiLimiter = rateLimit({
  ...limiterOptions,
  limit: 1000,
  message: { message: "Too many requests. Please try again later" },
});

// Strict limit for login and register; successful logins are not counted
const authLimiter = rateLimit({
  ...limiterOptions,
  limit: 20,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Please try again in 15 minutes" },
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "100kb" }));

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;