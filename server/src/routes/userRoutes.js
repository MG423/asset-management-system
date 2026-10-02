import { Router } from "express";
import { getUsers, createUser, updateUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));

router.route("/").get(getUsers).post(createUser);
router.patch("/:id", updateUser);

export default router;