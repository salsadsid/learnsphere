import type { ZodSchema } from "zod";

export type ValidationResult<T> = {
  isValid: boolean;
  errors: string[];
  data?: T;
};

export const validateSchema = <T>(schema: ZodSchema<T>, input: unknown): ValidationResult<T> => {
  const result = schema.safeParse(input);

  if (result.success) {
    return { isValid: true, errors: [], data: result.data };
  }

  const errors = result.error.issues.map((issue) => issue.message);
  return { isValid: false, errors };
};
