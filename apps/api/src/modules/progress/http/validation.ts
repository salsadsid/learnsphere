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

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
export type ProgressParamInput = z.infer<typeof progressParamSchema>;

export const validateSaveProgressInput = (
  input: unknown
): ValidationResult<SaveProgressInput> => validateSchema(saveProgressSchema, input);

export const validateProgressParamInput = (
  input: unknown
): ValidationResult<ProgressParamInput> => validateSchema(progressParamSchema, input);
