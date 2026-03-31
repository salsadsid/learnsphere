import type { ZodSchema } from "zod";
import { z } from "zod";

export type ValidationResult<T> = {
  isValid: boolean;
  errors: string[];
  data?: T;
};

export const validateSchema = <T extends ZodSchema>(
  schema: T,
  input: unknown
): ValidationResult<z.infer<T>> => {
  const result = schema.safeParse(input);

  if (result.success) {
    return { isValid: true, errors: [], data: result.data };
  }

  const errors = result.error.issues.map((issue) => issue.message);
  return { isValid: false, errors };
};
