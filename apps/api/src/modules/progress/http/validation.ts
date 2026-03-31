import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const saveProgressSchema = z.object({
  videoId: z.string().min(1, "Video id is required."),
  positionSeconds: z.number().min(0, "Position must be non-negative."),
  durationSeconds: z.number().min(1, "Duration must be at least 1 second."),
  deviceId: z.string().min(1).optional(),
  clientUpdatedAt: z.number().int().positive().optional(),
});

const progressParamSchema = z.object({
  videoId: z.string().min(1, "Video id is required."),
});

const completionSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
  lessonId: z.string().min(1, "Lesson id is required."),
});

const courseParamSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
});

const snapshotSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
  lessonId: z.string().min(1, "Lesson id is required."),
  positionSeconds: z.number().min(0, "Position must be non-negative."),
  durationSeconds: z.number().min(1, "Duration must be at least 1 second."),
});

const eventSchema = z.object({
  courseId: z.string().min(1, "Course id is required."),
  lessonId: z.string().min(1, "Lesson id is required."),
  eventType: z.enum(["play", "pause", "ended", "seeked", "error", "loaded"]),
  positionSeconds: z.number().min(0, "Position must be non-negative.").optional(),
  deviceId: z.string().min(1).optional(),
});

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
export type ProgressParamInput = z.infer<typeof progressParamSchema>;
export type LessonCompletionInput = z.infer<typeof completionSchema>;
export type CourseParamInput = z.infer<typeof courseParamSchema>;
export type WatchSnapshotInput = z.infer<typeof snapshotSchema>;
export type VideoEventInput = z.infer<typeof eventSchema>;

export const validateSaveProgressInput = (
  input: unknown
): ValidationResult<SaveProgressInput> => validateSchema(saveProgressSchema, input);

export const validateProgressParamInput = (
  input: unknown
): ValidationResult<ProgressParamInput> => validateSchema(progressParamSchema, input);

export const validateLessonCompletionInput = (
  input: unknown
): ValidationResult<LessonCompletionInput> => validateSchema(completionSchema, input);

export const validateCourseParamInput = (
  input: unknown
): ValidationResult<CourseParamInput> => validateSchema(courseParamSchema, input);

export const validateWatchSnapshotInput = (
  input: unknown
): ValidationResult<WatchSnapshotInput> => validateSchema(snapshotSchema, input);

export const validateVideoEventInput = (
  input: unknown
): ValidationResult<VideoEventInput> => validateSchema(eventSchema, input);
