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
  validateLessonIdParam,
  validateListCategoriesInput,
  validateListCoursesInput,
  validateModuleIdParam,
  validateUpdateLessonInput,
  validateUpdateModuleInput,
  validateUpdateCourseInput,
} from "./validation";
import {
  createCourseService,
  createLessonService,
  createModuleService,
  deleteLessonService,
  deleteCourseService,
  getCourseDetailService,
  getInstructorSummaryService,
  listCourseCategoriesService,
  listCoursesService,
  listInstructorCoursesService,
  publishCourseService,
  unpublishCourseService,
  updateCourseService,
  updateLessonService,
  updateModuleService,
} from "./service";
import { findCourseById } from "../infra/course-store";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const coursesRouter = Router();

const assertCourseOwnership = async (
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
      detail: "You do not have permission to manage this course.",
      type: "https://httpstatuses.com/403",
    });
  }
};

coursesRouter.get("/categories", async (req, res, next) => {
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

    res.json(await listCourseCategoriesService(validation.data));
  } catch (error) {
    next(error);
  }
});

coursesRouter.get(
  "/instructor/summary",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
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

      res.json(await getInstructorSummaryService(req.user.id));
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.get(
  "/instructor/courses",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      res.json(await listInstructorCoursesService(req.user.id, validation.data));
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/",
  requireAuth,
  requireRole({ roles: ["instructor", "admin"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      const course = await createCourseService({
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

coursesRouter.get("/", async (req, res, next) => {
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

    const response = await listCoursesService(validation.data);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

coursesRouter.get("/:courseId", async (req, res, next) => {
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

    const response = await getCourseDetailService(paramsValidation.data.courseId);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

coursesRouter.post(
  "/:courseId/modules",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertCourseOwnership(paramsValidation.data.courseId, req.user);

      const moduleItem = await createModuleService({
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

coursesRouter.patch(
  "/:courseId/modules/:moduleId",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      const validation = validateUpdateModuleInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid module update input.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      await assertCourseOwnership(courseValidation.data.courseId, req.user);

      const moduleItem = await updateModuleService({
        courseId: courseValidation.data.courseId,
        moduleId: moduleValidation.data.moduleId,
        ...(validation.data.title !== undefined ? { title: validation.data.title } : {}),
        ...(validation.data.summary !== undefined
          ? { summary: validation.data.summary }
          : {}),
        ...(validation.data.order !== undefined ? { order: validation.data.order } : {}),
      });

      res.json(moduleItem);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/:courseId/modules/:moduleId/lessons",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertCourseOwnership(courseValidation.data.courseId, req.user);

      const quizPayload = validation.data.quiz
        ? {
            questions: validation.data.quiz.questions.map((question) => ({
              id: question.id,
              prompt: question.prompt,
              options: question.options,
              ...(question.multipleCorrect !== undefined
                ? { multipleCorrect: question.multipleCorrect }
                : {}),
            })),
            ...(validation.data.quiz.title !== undefined
              ? { title: validation.data.quiz.title }
              : {}),
            ...(validation.data.quiz.passingScore !== undefined
              ? { passingScore: validation.data.quiz.passingScore }
              : {}),
          }
        : undefined;

      const lesson = await createLessonService({
        courseId: courseValidation.data.courseId,
        moduleId: moduleValidation.data.moduleId,
        title: validation.data.title,
        type: validation.data.type,
        ...(validation.data.content !== undefined
          ? { content: validation.data.content }
          : {}),
        ...(validation.data.resourceUrl !== undefined
          ? { resourceUrl: validation.data.resourceUrl }
          : {}),
        ...(quizPayload !== undefined ? { quiz: quizPayload } : {}),
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
  "/:courseId/modules/:moduleId/lessons/:lessonId",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const courseValidation = validateCourseIdParam(req.params);
      const moduleValidation = validateModuleIdParam(req.params);
      const lessonValidation = validateLessonIdParam(req.params);

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

      if (!lessonValidation.isValid || !lessonValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid lesson id.",
          errors: lessonValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      const validation = validateUpdateLessonInput(req.body);
      if (!validation.isValid || !validation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid lesson update input.",
          errors: validation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      await assertCourseOwnership(courseValidation.data.courseId, req.user);

      const quizPayload = validation.data.quiz
        ? {
            questions: validation.data.quiz.questions.map((question) => ({
              id: question.id,
              prompt: question.prompt,
              options: question.options,
              ...(question.multipleCorrect !== undefined
                ? { multipleCorrect: question.multipleCorrect }
                : {}),
            })),
            ...(validation.data.quiz.title !== undefined
              ? { title: validation.data.quiz.title }
              : {}),
            ...(validation.data.quiz.passingScore !== undefined
              ? { passingScore: validation.data.quiz.passingScore }
              : {}),
          }
        : undefined;

      const lesson = await updateLessonService({
        courseId: courseValidation.data.courseId,
        moduleId: moduleValidation.data.moduleId,
        lessonId: lessonValidation.data.lessonId,
        title: validation.data.title,
        type: validation.data.type,
        ...(validation.data.content !== undefined
          ? { content: validation.data.content }
          : {}),
        ...(validation.data.resourceUrl !== undefined
          ? { resourceUrl: validation.data.resourceUrl }
          : {}),
        ...(quizPayload !== undefined ? { quiz: quizPayload } : {}),
        ...(validation.data.order !== undefined ? { order: validation.data.order } : {}),
        ...(validation.data.durationMinutes !== undefined
          ? { durationMinutes: validation.data.durationMinutes }
          : {}),
      });

      res.json(lesson);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.delete(
  "/:courseId/modules/:moduleId/lessons/:lessonId",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const courseValidation = validateCourseIdParam(req.params);
      const moduleValidation = validateModuleIdParam(req.params);
      const lessonValidation = validateLessonIdParam(req.params);

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

      if (!lessonValidation.isValid || !lessonValidation.data) {
        throw new AppError({
          status: 400,
          title: "Validation Error",
          detail: "Invalid lesson id.",
          errors: lessonValidation.errors,
          type: "https://httpstatuses.com/400",
        });
      }

      await assertCourseOwnership(courseValidation.data.courseId, req.user);

      const response = await deleteLessonService({
        courseId: courseValidation.data.courseId,
        moduleId: moduleValidation.data.moduleId,
        lessonId: lessonValidation.data.lessonId,
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.patch(
  "/:courseId",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertCourseOwnership(paramsValidation.data.courseId, req.user);

      const updated = await updateCourseService({
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
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertCourseOwnership(paramsValidation.data.courseId, req.user);
      const updated = await publishCourseService(paramsValidation.data.courseId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.post(
  "/:courseId/unpublish",
  requireAuth,
  requireRole({ roles: ["instructor"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertCourseOwnership(paramsValidation.data.courseId, req.user);
      const updated = await unpublishCourseService(paramsValidation.data.courseId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

coursesRouter.delete(
  "/:courseId",
  requireAuth,
  requireRole({ roles: ["admin"] }),
  async (req: AuthenticatedRequest, res, next) => {
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

      await assertCourseOwnership(paramsValidation.data.courseId, req.user);
      const deleted = await deleteCourseService(paramsValidation.data.courseId);
      res.json(deleted);
    } catch (error) {
      next(error);
    }
  }
);
