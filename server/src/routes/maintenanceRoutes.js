import { Router } from "express";
import {
  getRecords, createRecord, updateRecord, completeRecord, deleteRecord,
} from "../controllers/maintenanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.route("/").get(getRecords).post(createRecord);
router.route("/:id").put(updateRecord).delete(authorize("admin"), deleteRecord);
router.patch("/:id/complete", completeRecord);

export default router;