import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const courseLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
const courseStatusSchema = z.enum(["draft", "published"]);
const lessonTypeSchema = z.enum(["video", "link", "text", "pdf", "quiz"]);

const quizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, "Option text is required."),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1, "Question prompt is required."),
    options: z.array(quizOptionSchema).min(2, "At least two options are required."),
    multipleCorrect: z.boolean().optional(),
  })
  .refine(
    (question) => question.options.some((option) => option.isCorrect),
    "Each question must have at least one correct option."
  );

const lessonQuizSchema = z.object({
  title: z.string().max(120, "Quiz title must be at most 120 characters.").optional(),
  passingScore: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional(),
  questions: z.array(quizQuestionSchema).min(1, "Add at least one quiz question."),
});

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

const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1, "Lesson id is required."),
});

const createModuleSchema = z.object({
  title: z
    .string()
    .min(3, "Module title must be at least 3 characters.")
    .max(120, "Module title must be at most 120 characters."),
  summary: z.string().max(300, "Summary must be at most 300 characters.").optional(),
  order: z.coerce.number().int().min(1).optional(),
});

const createLessonSchema = z
  .object({
    title: z
      .string()
      .min(3, "Lesson title must be at least 3 characters.")
      .max(120, "Lesson title must be at most 120 characters."),
    type: lessonTypeSchema,
    content: z.string().max(2000, "Content must be at most 2000 characters.").optional(),
    resourceUrl: z.string().url("Resource URL must be valid.").max(2000).optional(),
    quiz: lessonQuizSchema.optional(),
    order: z.coerce.number().int().min(1).optional(),
    durationMinutes: z.coerce.number().int().min(1).max(600).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "quiz") {
      if (!data.quiz) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Quiz details are required." });
      }
      return;
    }

    if (data.type === "text") {
      if (!data.content || data.content.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Text lessons require content.",
        });
      }
      return;
    }

    if (!data.resourceUrl || data.resourceUrl.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A resource URL is required for this lesson type.",
      });
    }
  });

const updateModuleSchema = z
  .object({
    title: z
      .string()
      .min(3, "Module title must be at least 3 characters.")
      .max(120, "Module title must be at most 120 characters.")
      .optional(),
    summary: z.string().max(300, "Summary must be at most 300 characters.").optional(),
    order: z.coerce.number().int().min(1).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined || data.summary !== undefined || data.order !== undefined,
    {
      message: "At least one field is required.",
    }
  );

const updateLessonSchema = createLessonSchema;

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
export type LessonIdParam = z.infer<typeof lessonIdParamSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
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

export const validateLessonIdParam = (input: unknown): ValidationResult<LessonIdParam> =>
  validateSchema(lessonIdParamSchema, input);

export const validateCreateModuleInput = (
  input: unknown
): ValidationResult<CreateModuleInput> =>
  validateSchema(createModuleSchema, input);

export const validateCreateLessonInput = (
  input: unknown
): ValidationResult<CreateLessonInput> =>
  validateSchema(createLessonSchema, input);

export const validateUpdateModuleInput = (
  input: unknown
): ValidationResult<UpdateModuleInput> => validateSchema(updateModuleSchema, input);

export const validateUpdateLessonInput = (
  input: unknown
): ValidationResult<UpdateLessonInput> => validateSchema(updateLessonSchema, input);

export const validateUpdateCourseInput = (
  input: unknown
): ValidationResult<UpdateCourseInput> =>
  validateSchema(updateCourseSchema, input);

export const validateListCategoriesInput = (
  input: unknown
): ValidationResult<ListCategoriesInput> =>
  validateSchema(listCategoriesSchema, input);
