import { Router } from "express";
import { randomUUID } from "crypto";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import { requireRole } from "../../auth/http/roles";
import { validateVideoUploadInput } from "./validation";
import type { VideoUploadResponseDto } from "./dto";

export const videosRouter = Router();

videosRouter.post(
  "/upload-url",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req, res, next) => {
    try {
      const validation = validateVideoUploadInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid upload request.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      const assetId = randomUUID();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const response: VideoUploadResponseDto = {
        uploadUrl: `https://upload.learnsphere.local/${assetId}`,
        assetUrl: `https://cdn.learnsphere.local/${assetId}/${encodeURIComponent(
          validation.data.fileName
        )}`,
        expiresAt: expiresAt.toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);
