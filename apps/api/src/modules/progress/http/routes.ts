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

const assertInstructorAccess = (courseId: string, user: AuthUser | undefined): void => {
  if (!user) {
    throw new AppError({
      status: 401,
      title: "Unauthorized",
      detail: "Missing user context.",
      type: "https://httpstatuses.com/401",
    });
  }

  const course = findCourseById(courseId);
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
  (req: AuthenticatedRequest, res, next) => {
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

      assertInstructorAccess(validation.data.courseId, req.user);

      const response: InstructorCourseProgressResponseDto = getInstructorCourseProgressService(
        validation.data.courseId
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

progressRouter.get("/student/summary", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const response: StudentDashboardResponseDto = getStudentDashboardService(req.user.id);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.get(
  "/instructor/course/:courseId/export",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
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

      assertInstructorAccess(validation.data.courseId, req.user);

      const data = getInstructorCourseProgressService(validation.data.courseId);
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

progressRouter.get("/course/:courseId", requireAuth, (req: AuthenticatedRequest, res, next) => {
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

    assertCourseAccess(validation.data.courseId, req.user);

    const response: CourseProgressResponseDto = getCourseProgressService(
      req.user.id,
      validation.data.courseId
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/completions/:courseId", requireAuth, (req: AuthenticatedRequest, res, next) => {
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

    assertCourseAccess(validation.data.courseId, req.user);

    const response = listLessonCompletionsService(req.user.id, validation.data.courseId);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

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

    const response = getVideoProgressService(req.user.id, validation.data.videoId);

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

    const response: SaveProgressResponseDto = saveVideoProgressService(req.user.id, validation.data);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/completions", requireAuth, (req: AuthenticatedRequest, res, next) => {
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

    assertCourseAccess(validation.data.courseId, req.user);

    const course = findCourseById(validation.data.courseId);
    if (!course) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Course not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const lesson = findLessonById(validation.data.lessonId);
    if (!lesson || lesson.courseId !== validation.data.courseId) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Lesson not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const response: LessonCompletionResponseDto = markLessonCompleteService(
      req.user.id,
      validation.data
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/snapshots", requireAuth, (req: AuthenticatedRequest, res, next) => {
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

    assertCourseAccess(validation.data.courseId, req.user);

    const course = findCourseById(validation.data.courseId);
    if (!course) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Course not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const lesson = findLessonById(validation.data.lessonId);
    if (!lesson || lesson.courseId !== validation.data.courseId) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Lesson not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const response: WatchSnapshotResponseDto = addWatchSnapshotService(
      req.user.id,
      validation.data
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/events", requireAuth, (req: AuthenticatedRequest, res, next) => {
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

    assertCourseAccess(validation.data.courseId, req.user);

    const course = findCourseById(validation.data.courseId);
    if (!course) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Course not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const lesson = findLessonById(validation.data.lessonId);
    if (!lesson || lesson.courseId !== validation.data.courseId) {
      throw new AppError({
        status: 404,
        title: "Not Found",
        detail: "Lesson not found.",
        type: "https://httpstatuses.com/404",
      });
    }

    const response: VideoEventResponseDto = addVideoEventService(
      req.user.id,
      validation.data
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});
