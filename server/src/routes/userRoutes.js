import { Router } from "express";
import { getUsers, createUser, updateUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../validation/schemas.js";

const router = Router();

router.use(protect, authorize("admin"));

router.route("/").get(getUsers).post(validate(createUserSchema), createUser);
router.patch("/:id", validate(updateUserSchema), updateUser);

export default router;