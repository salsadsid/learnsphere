import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const roleSchema = z.enum(["student", "instructor", "admin"]);
const statusSchema = z.enum(["active", "inactive"]);

const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().min(1).optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
});

const userIdParamSchema = z.object({
  userId: z.string().min(1, "User id is required."),
});

const updateRoleSchema = z.object({
  role: roleSchema,
});

const updateStatusSchema = z.object({
  status: statusSchema,
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const validateListUsersInput = (input: unknown): ValidationResult<ListUsersInput> =>
  validateSchema(listUsersSchema, input);

export const validateUserIdParam = (input: unknown): ValidationResult<UserIdParam> =>
  validateSchema(userIdParamSchema, input);

export const validateUpdateRoleInput = (input: unknown): ValidationResult<UpdateRoleInput> =>
  validateSchema(updateRoleSchema, input);

export const validateUpdateStatusInput = (input: unknown): ValidationResult<UpdateStatusInput> =>
  validateSchema(updateStatusSchema, input);

export const validateResetPasswordInput = (
  input: unknown
): ValidationResult<ResetPasswordInput> => validateSchema(resetPasswordSchema, input);
