import type { Request } from "express";
import { Router } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import { requireRole } from "../../auth/http/roles";
import type { AuthUser } from "../../auth/domain/types";
import { findCourseById, findLessonById } from "../../courses/infra/course-store";
import { assertCourseAccess } from "../../enrollment/http/service";
import {
  addVideoEventService,
  addWatchSnapshotService,
  buildInstructorCourseProgressCsv,
  getCourseProgressService,
  getInstructorCourseProgressService,
  getStudentDashboardService,
  getVideoProgressService,
  listLessonCompletionsService,
  markLessonCompleteService,
  saveVideoProgressService,
} from "./service";
import {
  validateCourseParamInput,
  validateLessonCompletionInput,
  validateProgressParamInput,
  validateSaveProgressInput,
  validateVideoEventInput,
  validateWatchSnapshotInput,
} from "./validation";
import type {
  CourseProgressResponseDto,
  InstructorCourseProgressResponseDto,
  LessonCompletionResponseDto,
  SaveProgressResponseDto,
  StudentDashboardResponseDto,
  VideoEventResponseDto,
  WatchSnapshotResponseDto,
} from "./dto";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const progressRouter = Router();

const assertInstructorAccess = async (
  courseId: string,
  user: AuthUser | undefined
): Promise<void> => {
  if (!user) {
    throw new AppError({
      status: 401,
      title: "Unauthorized",
      detail: "Missing user context.",
      type: "https://httpstatuses.com/401",
    });
  }

  const course = await findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  if (user.role === "admin") {
    return;
  }

  if (course.instructorId !== user.id) {
    throw new AppError({
      status: 403,
      title: "Forbidden",
      detail: "You do not have permission to access this course.",
      type: "https://httpstatuses.com/403",
    });
  }
};

progressRouter.get(
  "/instructor/course/:courseId",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertInstructorAccess(validation.data.courseId, req.user);

      const response: InstructorCourseProgressResponseDto =
        await getInstructorCourseProgressService(validation.data.courseId);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

progressRouter.get(
  "/student/summary",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const response: StudentDashboardResponseDto = await getStudentDashboardService(req.user.id);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.get(
  "/instructor/course/:courseId/export",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertInstructorAccess(validation.data.courseId, req.user);

      const data = await getInstructorCourseProgressService(validation.data.courseId);
      const csv = buildInstructorCourseProgressCsv(data);

      res
        .status(200)
        .type("text/csv")
        .setHeader(
          "Content-Disposition",
          `attachment; filename=course-progress-${validation.data.courseId}.csv`
        )
        .send(csv);
    } catch (error) {
      next(error);
    }
  }
);

progressRouter.get(
  "/course/:courseId",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
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

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    await assertCourseAccess(validation.data.courseId, req.user);

    const response: CourseProgressResponseDto = await getCourseProgressService(
      req.user.id,
      validation.data.courseId
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.get(
  "/completions/:courseId",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
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

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    await assertCourseAccess(validation.data.courseId, req.user);

    const response = await listLessonCompletionsService(req.user.id, validation.data.courseId);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/:videoId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
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

    const response = await getVideoProgressService(req.user.id, validation.data.videoId);

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

progressRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
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

    const response: SaveProgressResponseDto = await saveVideoProgressService(
      req.user.id,
      validation.data
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post(
  "/completions",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateLessonCompletionInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid completion payload.",
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

    await assertCourseAccess(validation.data.courseId, req.user);

    const course = await findCourseById(validation.data.courseId);
    if (!course) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Course not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const lesson = await findLessonById(validation.data.lessonId);
    if (!lesson || lesson.courseId !== validation.data.courseId) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Lesson not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const response: LessonCompletionResponseDto = await markLessonCompleteService(
      req.user.id,
      validation.data
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post(
  "/snapshots",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateWatchSnapshotInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid snapshot payload.",
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

    await assertCourseAccess(validation.data.courseId, req.user);

    const course = await findCourseById(validation.data.courseId);
    if (!course) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Course not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const lesson = await findLessonById(validation.data.lessonId);
    if (!lesson || lesson.courseId !== validation.data.courseId) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Lesson not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const response: WatchSnapshotResponseDto = await addWatchSnapshotService(
      req.user.id,
      validation.data
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/events", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateVideoEventInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid video event payload.",
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

    await assertCourseAccess(validation.data.courseId, req.user);

    const course = await findCourseById(validation.data.courseId);
    if (!course) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Course not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const lesson = await findLessonById(validation.data.lessonId);
    if (!lesson || lesson.courseId !== validation.data.courseId) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Lesson not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const response: VideoEventResponseDto = await addVideoEventService(
      req.user.id,
      validation.data
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});
