import { Router } from "express";
import {
  getAssignments, createAssignment, returnAssignment,
} from "../controllers/assignmentController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.route("/").get(getAssignments).post(createAssignment);
router.patch("/:id/return", returnAssignment);

export default router;