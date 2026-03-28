import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const MIN_PASSWORD_LENGTH = 8;

const registerSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Email must be valid."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
});

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Email must be valid."),
  password: z.string().min(1, "Password is required."),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});

export const validateRegisterInput = (input: unknown): ValidationResult<{
  email: string;
  password: string;
}> => validateSchema(registerSchema, input);

export const validateLoginInput = (input: unknown): ValidationResult<{
  email: string;
  password: string;
}> => validateSchema(loginSchema, input);

export const validateRefreshInput = (input: unknown): ValidationResult<{
  refreshToken: string;
}> => validateSchema(refreshSchema, input);
