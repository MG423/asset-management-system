import { Router } from "express";
import {
  register, login, getMe, updateProfile, changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema, loginSchema, profileSchema, passwordSchema,
} from "../validation/schemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(profileSchema), updateProfile);
router.put("/password", protect, validate(passwordSchema), changePassword);

export default router;