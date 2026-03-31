import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const enrollSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
});

const courseParamSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
export type CourseParamInput = z.infer<typeof courseParamSchema>;

export const validateEnrollInput = (input: unknown): ValidationResult<EnrollInput> =>
  validateSchema(enrollSchema, input);

export const validateCourseParamInput = (input: unknown): ValidationResult<CourseParamInput> =>
  validateSchema(courseParamSchema, input);
