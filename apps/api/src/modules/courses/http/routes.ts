import type { Request } from "express";
import { Router } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import { requireRole } from "../../auth/http/roles";
import type { AuthUser } from "../../auth/domain/types";
import {
  validateCourseIdParam,
  validateCreateCourseInput,
  validateCreateLessonInput,
  validateCreateModuleInput,
  validateListCategoriesInput,
  validateListCoursesInput,
  validateModuleIdParam,
  validateUpdateCourseInput,
} from "./validation";
import {
  createCourseService,
  createLessonService,
  createModuleService,
  getCourseDetailService,
  getInstructorSummaryService,
  listCourseCategoriesService,
  listCoursesService,
  listInstructorCoursesService,
  publishCourseService,
  unpublishCourseService,
  updateCourseService,
} from "./service";
import { findCourseById } from "../infra/course-store";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const coursesRouter = Router();

const assertCourseOwnership = (courseId: string, user: AuthUser | undefined): void => {
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
      detail: "You do not have permission to manage this course.",
      type: "https://httpstatuses.com/403",
    });
  }
};

coursesRouter.get("/categories", (req, res, next) => {
  try {
    const validation = validateListCategoriesInput(req.query);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid category query parameters.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    res.json(listCourseCategoriesService(validation.data));
  } catch (error) {
    next(error);
  }
});

coursesRouter.get(
  "/instructor/summary",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user) {
        throw new AppError({
          status: 401,
          title: "Unauthorized",
          detail: "Missing user context.",
          type: "https://httpstatuses.com/401",
        });
      }

      res.json(getInstructorSummaryService(req.user.id));
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.get(
  "/instructor/courses",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const validation = validateListCoursesInput(req.query);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course query parameters.",
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

      res.json(listInstructorCoursesService(req.user.id, validation.data));
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const validation = validateCreateCourseInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course input.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      const instructorId = req.user?.id;
      if (!instructorId) {
        throw new AppError({
          status: 401,
          title: "Unauthorized",
          detail: "Missing instructor context.",
          type: "https://httpstatuses.com/401",
        });
      }

      const course = createCourseService({
        title: validation.data.title,
        instructorId,
        ...(validation.data.summary !== undefined ? { summary: validation.data.summary } : {}),
        ...(validation.data.category !== undefined ? { category: validation.data.category } : {}),
        ...(validation.data.level !== undefined ? { level: validation.data.level } : {}),
      });

      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.get("/", (req, res, next) => {
  try {
    const validation = validateListCoursesInput(req.query);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid course query parameters.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const response = listCoursesService(validation.data);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

coursesRouter.get("/:courseId", (req, res, next) => {
  try {
    const paramsValidation = validateCourseIdParam(req.params);
    if (!paramsValidation.isValid || !paramsValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid course id.",
        errors: paramsValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const response = getCourseDetailService(paramsValidation.data.courseId);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

coursesRouter.post(
  "/:courseId/modules",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const paramsValidation = validateCourseIdParam(req.params);
      if (!paramsValidation.isValid || !paramsValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course id.",
          errors: paramsValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      const validation = validateCreateModuleInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid module input.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      assertCourseOwnership(paramsValidation.data.courseId, req.user);

      const moduleItem = createModuleService({
        courseId: paramsValidation.data.courseId,
        title: validation.data.title,
        ...(validation.data.summary !== undefined
          ? { summary: validation.data.summary }
          : {}),
        ...(validation.data.order !== undefined ? { order: validation.data.order } : {}),
      });

      res.status(201).json(moduleItem);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/:courseId/modules/:moduleId/lessons",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const courseValidation = validateCourseIdParam(req.params);
      const moduleValidation = validateModuleIdParam(req.params);

      if (!courseValidation.isValid || !courseValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course id.",
          errors: courseValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      if (!moduleValidation.isValid || !moduleValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid module id.",
          errors: moduleValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      const validation = validateCreateLessonInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid lesson input.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      assertCourseOwnership(courseValidation.data.courseId, req.user);

      const lesson = createLessonService({
        courseId: courseValidation.data.courseId,
        moduleId: moduleValidation.data.moduleId,
        title: validation.data.title,
        ...(validation.data.content !== undefined
          ? { content: validation.data.content }
          : {}),
        ...(validation.data.order !== undefined ? { order: validation.data.order } : {}),
        ...(validation.data.durationMinutes !== undefined
          ? { durationMinutes: validation.data.durationMinutes }
          : {}),
      });

      res.status(201).json(lesson);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.patch(
  "/:courseId",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const paramsValidation = validateCourseIdParam(req.params);
      if (!paramsValidation.isValid || !paramsValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course id.",
          errors: paramsValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      const validation = validateUpdateCourseInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course update input.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      assertCourseOwnership(paramsValidation.data.courseId, req.user);

      const updated = updateCourseService({
        courseId: paramsValidation.data.courseId,
        ...(validation.data.title !== undefined ? { title: validation.data.title } : {}),
        ...(validation.data.summary !== undefined ? { summary: validation.data.summary } : {}),
        ...(validation.data.category !== undefined ? { category: validation.data.category } : {}),
        ...(validation.data.level !== undefined ? { level: validation.data.level } : {}),
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/:courseId/publish",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const paramsValidation = validateCourseIdParam(req.params);
      if (!paramsValidation.isValid || !paramsValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course id.",
          errors: paramsValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      assertCourseOwnership(paramsValidation.data.courseId, req.user);
      const updated = publishCourseService(paramsValidation.data.courseId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/:courseId/unpublish",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  (req: AuthenticatedRequest, res, next) => {
    try {
      const paramsValidation = validateCourseIdParam(req.params);
      if (!paramsValidation.isValid || !paramsValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid course id.",
          errors: paramsValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      assertCourseOwnership(paramsValidation.data.courseId, req.user);
      const updated = unpublishCourseService(paramsValidation.data.courseId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);
