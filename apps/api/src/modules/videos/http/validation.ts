import { z } from "zod";
import type { ValidationResult } from "../../../shared/validation";
import { validateSchema } from "../../../shared/validation";

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const supportedTypes = ["video/mp4", "video/webm"] as const;

const uploadSchema = z.object({
  fileName: z.string().min(1, "File name is required."),
  contentType: z.enum(supportedTypes, {
    errorMap: () => ({ message: "Unsupported video format." }),
  }),
  sizeBytes: z.number().int().min(1).max(MAX_VIDEO_SIZE_BYTES),
});

export type VideoUploadInput = z.infer<typeof uploadSchema>;

export const validateVideoUploadInput = (
  input: unknown
): ValidationResult<VideoUploadInput> => validateSchema(uploadSchema, input);
