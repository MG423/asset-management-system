import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";
import assetRoutes from "./routes/assetRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import { logActivity } from "./utils/logActivity.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

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
app.use(notFound);
app.use(errorHandler);

export default app;