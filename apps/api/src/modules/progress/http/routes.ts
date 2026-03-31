import type { Request } from "express";
import { Router } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import type { AuthUser } from "../../auth/domain/types";
import { findProgress, saveProgress } from "../infra/progress-store";
import { validateProgressParamInput, validateSaveProgressInput } from "./validation";
import type { ProgressResponseDto, SaveProgressResponseDto } from "./dto";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const progressRouter = Router();

const toProgressResponse = (record: ReturnType<typeof findProgress>): ProgressResponseDto | null => {
  if (!record) {
    return null;
  }

  return {
    videoId: record.videoId,
    positionSeconds: record.positionSeconds,
    durationSeconds: record.durationSeconds,
    updatedAt: record.updatedAt.toISOString(),
    ...(record.deviceId !== undefined ? { deviceId: record.deviceId } : {}),
    ...(record.clientUpdatedAt !== undefined
      ? { clientUpdatedAt: record.clientUpdatedAt.toISOString() }
      : {}),
  };
};

progressRouter.get("/:videoId", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateProgressParamInput(req.params);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid video id.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const record = findProgress(req.user.id, validation.data.videoId);
    const response = toProgressResponse(record);

    if (!response) {
      res.status(404).json({
        title: "Not Found",
        status: 404,
        detail: "Progress not found.",
        type: "https://httpstatuses.com/404",
      });
      return;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateSaveProgressInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid progress payload.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const clientUpdatedAt = validation.data.clientUpdatedAt
      ? new Date(validation.data.clientUpdatedAt)
      : undefined;

    const result = saveProgress({
      userId: req.user.id,
      videoId: validation.data.videoId,
      positionSeconds: validation.data.positionSeconds,
      durationSeconds: validation.data.durationSeconds,
      ...(validation.data.deviceId !== undefined ? { deviceId: validation.data.deviceId } : {}),
      ...(clientUpdatedAt !== undefined ? { clientUpdatedAt } : {}),
    });

    const response: SaveProgressResponseDto = {
      accepted: result.accepted,
      record: toProgressResponse(result.record) as ProgressResponseDto,
      ...(result.reason !== undefined ? { reason: result.reason } : {}),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});
