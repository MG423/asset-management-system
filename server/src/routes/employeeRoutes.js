import { Router } from "express";
import {
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
} from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.route("/").get(getEmployees).post(createEmployee);
router
  .route("/:id")
  .get(getEmployee)
  .put(updateEmployee)
  .delete(authorize("admin"), deleteEmployee);

export default router;