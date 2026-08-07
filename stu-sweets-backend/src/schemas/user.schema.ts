import { z } from "zod";

const userRoleSchema = z.enum(["ADMIN", "SUPER_ADMIN"]);

// Схема для создания пользователя
export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6),
  name: z.string().min(1, "User name is required").optional(),
  role: userRoleSchema,
}).strict();
// Схема для обновления пользователя
export const updateUserSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1, "User name is required").optional(),
  role: userRoleSchema.optional(),
}).strict();
