import type { Request } from "express";
import { Router } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import type { AuthUser } from "../../auth/domain/types";
import {
  enrollUserService,
  getEnrollmentStatusService,
  listEnrollmentsService,
} from "./service";
import { validateCourseParamInput, validateEnrollInput } from "./validation";
import type { EnrollmentResponseDto, EnrollmentStatusResponseDto } from "./dto";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const enrollmentRouter = Router();

enrollmentRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    res.json(await listEnrollmentsService(req.user));
  } catch (error) {
    next(error);
  }
});

enrollmentRouter.get("/:courseId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateCourseParamInput(req.params);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid course id.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const response: EnrollmentStatusResponseDto = await getEnrollmentStatusService(
      validation.data.courseId,
      req.user
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
});

enrollmentRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateEnrollInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid enrollment payload.",
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

    const { response, created } = await enrollUserService(req.user, validation.data.courseId);
    const status = created ? 201 : 200;
    res.status(status).json(response as EnrollmentResponseDto);
  } catch (error) {
    next(error);
  }
});
