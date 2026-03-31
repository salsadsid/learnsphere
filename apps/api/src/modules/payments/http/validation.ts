import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const checkoutSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
});

const webhookSchema = z.object({
  eventId: z.string().min(1, "Event id is required."),
  type: z.enum(["payment.succeeded", "payment.failed"]),
  sessionId: z.string().min(1, "Session id is required."),
  courseId: z.string().min(1, "Course id is required."),
  userId: z.string().min(1, "User id is required."),
});

const courseParamSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
export type CourseParamInput = z.infer<typeof courseParamSchema>;

export const validateCheckoutInput = (input: unknown): ValidationResult<CheckoutInput> =>
  validateSchema(checkoutSchema, input);

export const validateWebhookInput = (input: unknown): ValidationResult<WebhookInput> =>
  validateSchema(webhookSchema, input);

export const validateCourseParamInput = (input: unknown): ValidationResult<CourseParamInput> =>
  validateSchema(courseParamSchema, input);
