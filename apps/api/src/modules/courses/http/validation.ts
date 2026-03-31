import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const courseLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
const courseStatusSchema = z.enum(["draft", "published"]);

const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be at most 120 characters."),
  summary: z.string().max(300, "Summary must be at most 300 characters.").optional(),
  category: z.string().max(80, "Category must be at most 80 characters.").optional(),
  level: courseLevelSchema.optional(),
});

const listCoursesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  instructorId: z.string().min(1).optional(),
  status: courseStatusSchema.optional(),
});

const courseIdParamSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
});

const moduleIdParamSchema = z.object({
  moduleId: z.string().min(1, "Module id is required."),
});

const createModuleSchema = z.object({
  title: z
    .string()
    .min(3, "Module title must be at least 3 characters.")
    .max(120, "Module title must be at most 120 characters."),
  summary: z.string().max(300, "Summary must be at most 300 characters.").optional(),
  order: z.coerce.number().int().min(1).optional(),
});

const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Lesson title must be at least 3 characters.")
    .max(120, "Lesson title must be at most 120 characters."),
  content: z.string().max(2000, "Content must be at most 2000 characters.").optional(),
  order: z.coerce.number().int().min(1).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(600).optional(),
});

const updateCourseSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters.")
      .max(120, "Title must be at most 120 characters.")
      .optional(),
    summary: z.string().max(300, "Summary must be at most 300 characters.").optional(),
    category: z.string().max(80, "Category must be at most 80 characters.").optional(),
    level: courseLevelSchema.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.summary !== undefined ||
      data.category !== undefined ||
      data.level !== undefined,
    {
      message: "At least one field is required.",
    }
  );

const listCategoriesSchema = z.object({
  status: courseStatusSchema.optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type ListCoursesInput = z.infer<typeof listCoursesSchema>;
export type CourseIdParam = z.infer<typeof courseIdParamSchema>;
export type ModuleIdParam = z.infer<typeof moduleIdParamSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;

export const validateCreateCourseInput = (
  input: unknown
): ValidationResult<CreateCourseInput> =>
  validateSchema(createCourseSchema, input);

export const validateListCoursesInput = (
  input: unknown
): ValidationResult<ListCoursesInput> =>
  validateSchema(listCoursesSchema, input);

export const validateCourseIdParam = (input: unknown): ValidationResult<CourseIdParam> =>
  validateSchema(courseIdParamSchema, input);

export const validateModuleIdParam = (input: unknown): ValidationResult<ModuleIdParam> =>
  validateSchema(moduleIdParamSchema, input);

export const validateCreateModuleInput = (
  input: unknown
): ValidationResult<CreateModuleInput> =>
  validateSchema(createModuleSchema, input);

export const validateCreateLessonInput = (
  input: unknown
): ValidationResult<CreateLessonInput> =>
  validateSchema(createLessonSchema, input);

export const validateUpdateCourseInput = (
  input: unknown
): ValidationResult<UpdateCourseInput> =>
  validateSchema(updateCourseSchema, input);

export const validateListCategoriesInput = (
  input: unknown
): ValidationResult<ListCategoriesInput> =>
  validateSchema(listCategoriesSchema, input);
