import type { Request } from "express";
import { Router } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import { requireRole } from "../../auth/http/roles";
import { createCourseUseCase } from "../use-cases/create-course";
import { createLessonUseCase } from "../use-cases/create-lesson";
import { createModuleUseCase } from "../use-cases/create-module";
import { getCourseDetailUseCase } from "../use-cases/get-course-detail";
import { updateCourseUseCase } from "../use-cases/update-course";
import type { Course, CourseModule, Lesson } from "../domain/types";
import type {
  CourseDetailResponseDto,
  CourseResponseDto,
  LessonResponseDto,
  ListCoursesResponseDto,
  ModuleResponseDto,
} from "./dto";
import {
  validateCourseIdParam,
  validateCreateCourseInput,
  validateCreateLessonInput,
  validateCreateModuleInput,
  validateListCoursesInput,
  validateModuleIdParam,
  validateUpdateCourseInput,
} from "./validation";
import { listCourses } from "../infra/course-store";

type AuthenticatedRequest = Request & { user?: { id: string } };

export const coursesRouter = Router();

const toCourseResponse = (course: Course): CourseResponseDto => ({
  id: course.id,
  title: course.title,
  status: course.status,
  instructorId: course.instructorId,
  createdAt: course.createdAt.toISOString(),
  updatedAt: course.updatedAt.toISOString(),
  ...(course.summary !== undefined ? { summary: course.summary } : {}),
  ...(course.category !== undefined ? { category: course.category } : {}),
  ...(course.level !== undefined ? { level: course.level } : {}),
});

const toLessonResponse = (lesson: Lesson): LessonResponseDto => ({
  id: lesson.id,
  title: lesson.title,
  order: lesson.order,
  ...(lesson.durationMinutes !== undefined
    ? { durationMinutes: lesson.durationMinutes }
    : {}),
});

const toModuleResponse = (moduleItem: CourseModule, moduleLessons: Lesson[]): ModuleResponseDto => ({
  id: moduleItem.id,
  title: moduleItem.title,
  order: moduleItem.order,
  lessonCount: moduleLessons.length,
  lessons: moduleLessons.map(toLessonResponse),
  ...(moduleItem.summary !== undefined ? { summary: moduleItem.summary } : {}),
});

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

      const course = createCourseUseCase({
        title: validation.data.title,
        instructorId,
        ...(validation.data.summary !== undefined ? { summary: validation.data.summary } : {}),
        ...(validation.data.category !== undefined ? { category: validation.data.category } : {}),
        ...(validation.data.level !== undefined ? { level: validation.data.level } : {}),
      });

      res.status(201).json(toCourseResponse(course));
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

    const { items, total } = listCourses({
      page: validation.data.page,
      pageSize: validation.data.pageSize,
      ...(validation.data.q !== undefined ? { q: validation.data.q } : {}),
      ...(validation.data.category !== undefined ? { category: validation.data.category } : {}),
      ...(validation.data.instructorId !== undefined
        ? { instructorId: validation.data.instructorId }
        : {}),
      ...(validation.data.status !== undefined ? { status: validation.data.status } : {}),
    });

    const totalPages = Math.ceil(total / validation.data.pageSize);
    const nextPage = validation.data.page < totalPages ? validation.data.page + 1 : null;

    const response: ListCoursesResponseDto = {
      items: items.map(toCourseResponse),
      page: validation.data.page,
      pageSize: validation.data.pageSize,
      total,
      totalPages,
      nextPage,
    };

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

    const detail = getCourseDetailUseCase(paramsValidation.data.courseId);

    const response: CourseDetailResponseDto = {
      ...toCourseResponse(detail.course),
      modules: detail.modules.map((entry) =>
        toModuleResponse(entry.module, entry.lessons)
      ),
    };

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

      const moduleItem = createModuleUseCase({
        courseId: paramsValidation.data.courseId,
        title: validation.data.title,
        ...(validation.data.summary !== undefined
          ? { summary: validation.data.summary }
          : {}),
        ...(validation.data.order !== undefined ? { order: validation.data.order } : {}),
      });

      res.status(201).json(toModuleResponse(moduleItem, []));
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

      const lesson = createLessonUseCase({
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

      res.status(201).json(toLessonResponse(lesson));
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

      const updated = updateCourseUseCase({
        courseId: paramsValidation.data.courseId,
        ...(validation.data.title !== undefined ? { title: validation.data.title } : {}),
        ...(validation.data.summary !== undefined ? { summary: validation.data.summary } : {}),
        ...(validation.data.category !== undefined ? { category: validation.data.category } : {}),
        ...(validation.data.level !== undefined ? { level: validation.data.level } : {}),
      });

      res.json(toCourseResponse(updated));
    } catch (error) {
      next(error);
    }
  }
);
