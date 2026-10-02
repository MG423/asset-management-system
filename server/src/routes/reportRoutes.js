import { Router } from "express";
import {
  assetsReport, assignmentsReport, maintenanceReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/assets", assetsReport);
router.get("/assignments", assignmentsReport);
router.get("/maintenance", maintenanceReport);

export default router;