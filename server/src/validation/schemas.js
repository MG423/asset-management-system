import { z } from "zod";

const name = z.string().trim().min(1, "Name is required").max(100, "Name is too long");
const email = z.string().trim().toLowerCase().email("Invalid email address");
const password = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password is too long");
const role = z.enum(["admin", "staff"]);

export const registerSchema = z.object({ name, email, password });

// Login only checks the types, so it never hints at what is a valid email or password
export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: name.optional(),
  email: email.optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: password,
});

export const createUserSchema = z.object({
  name,
  email,
  password,
  role: role.default("staff"),
});

export const updateUserSchema = z.object({
  name: name.optional(),
  role: role.optional(),
  active: z.boolean().optional(),
  password: password.optional(),
});