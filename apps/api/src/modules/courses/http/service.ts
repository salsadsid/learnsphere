import type { Course, CourseModule, Lesson, LessonQuiz, LessonType } from "../domain/types";
import type {
  CourseCategoriesResponseDto,
  CourseDetailResponseDto,
  CourseResponseDto,
  InstructorSummaryResponseDto,
  LessonResponseDto,
  ListCoursesResponseDto,
  ModuleResponseDto,
} from "./dto";
import type { ListCategoriesInput, ListCoursesInput } from "./validation";
import {
  countLessonsByInstructor,
  countModulesByInstructor,
  listLessonsByModule,
  listCategories,
  listCourses,
} from "../infra/course-store";
import { clearCacheByPrefix, getOrSetCache } from "../../../shared/cache";
import { listEnrollmentsByCourse } from "../../enrollment/infra/enrollment-store";
import { enqueueCourseUpdateEmail } from "../../notifications/infra/notification-queue";
import { createCourseUseCase } from "../use-cases/create-course";
import { deleteCourseUseCase } from "../use-cases/delete-course";
import { createLessonUseCase } from "../use-cases/create-lesson";
import { createModuleUseCase } from "../use-cases/create-module";
import { deleteLessonUseCase } from "../use-cases/delete-lesson";
import { getCourseDetailUseCase } from "../use-cases/get-course-detail";
import { publishCourseUseCase } from "../use-cases/publish-course";
import { unpublishCourseUseCase } from "../use-cases/unpublish-course";
import { updateCourseUseCase } from "../use-cases/update-course";
import { updateLessonUseCase } from "../use-cases/update-lesson";
import { updateModuleUseCase } from "../use-cases/update-module";

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
  type: lesson.type,
  order: lesson.order,
  ...(lesson.durationMinutes !== undefined
    ? { durationMinutes: lesson.durationMinutes }
    : {}),
  ...(lesson.content !== undefined ? { content: lesson.content } : {}),
  ...(lesson.resourceUrl !== undefined ? { resourceUrl: lesson.resourceUrl } : {}),
  ...(lesson.quiz !== undefined ? { quiz: lesson.quiz } : {}),
});

const toModuleResponse = (moduleItem: CourseModule, moduleLessons: Lesson[]): ModuleResponseDto => ({
  id: moduleItem.id,
  title: moduleItem.title,
  order: moduleItem.order,
  lessonCount: moduleLessons.length,
  lessons: moduleLessons.map(toLessonResponse),
  ...(moduleItem.summary !== undefined ? { summary: moduleItem.summary } : {}),
});

const COURSES_LIST_TTL_MS = 30_000;
const COURSE_DETAIL_TTL_MS = 30_000;
const COURSE_CATEGORIES_TTL_MS = 60_000;

const buildCoursesListCacheKey = (input: {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  instructorId?: string;
  status?: "draft" | "published";
}): string => `courses:list:${JSON.stringify(input)}`;

const buildInstructorListCacheKey = (input: {
  page: number;
  pageSize: number;
  instructorId: string;
  q?: string;
  category?: string;
  status?: "draft" | "published";
}): string => `courses:instructor:${JSON.stringify(input)}`;

const buildCategoriesCacheKey = (status?: "draft" | "published"): string =>
  `courses:categories:${status ?? "all"}`;

const buildCourseDetailCacheKey = (courseId: string): string => `courses:detail:${courseId}`;

export const listCoursesService = async (input: ListCoursesInput): Promise<ListCoursesResponseDto> => {
  const listInput: {
    page: number;
    pageSize: number;
    q?: string;
    category?: string;
    instructorId?: string;
    status?: "draft" | "published";
  } = {
    page: input.page,
    pageSize: input.pageSize,
  };

  if (input.q !== undefined) {
    listInput.q = input.q;
  }

  if (input.category !== undefined) {
    listInput.category = input.category;
  }

  if (input.instructorId !== undefined) {
    listInput.instructorId = input.instructorId;
  }

  if (input.status !== undefined) {
    listInput.status = input.status;
  }

  const cacheKey = buildCoursesListCacheKey(listInput);

  return getOrSetCache(cacheKey, COURSES_LIST_TTL_MS, async () => {
    const { items, total } = await listCourses(listInput);
    const totalPages = Math.ceil(total / input.pageSize);
    const nextPage = input.page < totalPages ? input.page + 1 : null;

    return {
      items: items.map(toCourseResponse),
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages,
      nextPage,
    };
  });
};

export const listInstructorCoursesService = async (
  instructorId: string,
  input: ListCoursesInput
): Promise<ListCoursesResponseDto> => {
  const listInput: {
    page: number;
    pageSize: number;
    instructorId: string;
    q?: string;
    category?: string;
    status?: "draft" | "published";
  } = {
    page: input.page,
    pageSize: input.pageSize,
    instructorId,
  };

  if (input.q !== undefined) {
    listInput.q = input.q;
  }

  if (input.category !== undefined) {
    listInput.category = input.category;
  }

  if (input.status !== undefined) {
    listInput.status = input.status;
  }

  const cacheKey = buildInstructorListCacheKey(listInput);

  return getOrSetCache(cacheKey, COURSES_LIST_TTL_MS, async () => {
    const { items, total } = await listCourses(listInput);
    const totalPages = Math.ceil(total / input.pageSize);
    const nextPage = input.page < totalPages ? input.page + 1 : null;

    return {
      items: items.map(toCourseResponse),
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages,
      nextPage,
    };
  });
};

export const getInstructorSummaryService = async (
  instructorId: string
): Promise<InstructorSummaryResponseDto> => {
  const { items } = await listCourses({
    page: 1,
    pageSize: Number.MAX_SAFE_INTEGER,
    instructorId,
  });
  const totalCourses = items.length;
  const publishedCourses = items.filter((course) => course.status === "published").length;
  const draftCourses = items.filter((course) => course.status === "draft").length;

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    moduleCount: await countModulesByInstructor(instructorId),
    lessonCount: await countLessonsByInstructor(instructorId),
  };
};

export const listCourseCategoriesService = async (
  input: ListCategoriesInput
): Promise<CourseCategoriesResponseDto> => {
  const cacheKey = buildCategoriesCacheKey(input.status);

  return getOrSetCache(cacheKey, COURSE_CATEGORIES_TTL_MS, async () => {
    const categories = await listCategories({
      ...(input.status !== undefined ? { status: input.status } : {}),
    });

    return { categories };
  });
};

export const getCourseDetailService = async (
  courseId: string
): Promise<CourseDetailResponseDto> => {
  const cacheKey = buildCourseDetailCacheKey(courseId);

  return getOrSetCache(cacheKey, COURSE_DETAIL_TTL_MS, async () => {
    const detail = await getCourseDetailUseCase(courseId);

    return {
      ...toCourseResponse(detail.course),
      modules: detail.modules.map((entry) => toModuleResponse(entry.module, entry.lessons)),
    };
  });
};

export const createCourseService = async (input: {
  title: string;
  instructorId: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
}): Promise<CourseResponseDto> => {
  const course = await createCourseUseCase(input);
  clearCacheByPrefix("courses:");
  return toCourseResponse(course);
};

export const updateCourseService = async (input: {
  courseId: string;
  title?: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
}): Promise<CourseResponseDto> => {
  const course = await updateCourseUseCase(input);
  clearCacheByPrefix("courses:");
  const enrollments = await listEnrollmentsByCourse(course.id);
  for (const enrollment of enrollments) {
    enqueueCourseUpdateEmail({
      userId: enrollment.userId,
      courseId: course.id,
      courseTitle: course.title,
    });
  }
  return toCourseResponse(course);
};

export const createModuleService = async (input: {
  courseId: string;
  title: string;
  summary?: string;
  order?: number;
}): Promise<ModuleResponseDto> => {
  const moduleItem = await createModuleUseCase(input);
  clearCacheByPrefix("courses:");
  return toModuleResponse(moduleItem, []);
};

export const createLessonService = async (input: {
  courseId: string;
  moduleId: string;
  title: string;
  type: LessonType;
  content?: string;
  resourceUrl?: string;
  quiz?: LessonQuiz;
  order?: number;
  durationMinutes?: number;
}): Promise<LessonResponseDto> => {
  const lesson = await createLessonUseCase(input);
  clearCacheByPrefix("courses:");
  return toLessonResponse(lesson);
};

export const updateModuleService = async (input: {
  courseId: string;
  moduleId: string;
  title?: string;
  summary?: string;
  order?: number;
}): Promise<ModuleResponseDto> => {
  const moduleItem = await updateModuleUseCase(input);
  const lessons = await listLessonsByModule(moduleItem.id);
  clearCacheByPrefix("courses:");
  return toModuleResponse(moduleItem, lessons);
};

export const updateLessonService = async (input: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  type: LessonType;
  content?: string;
  resourceUrl?: string;
  quiz?: LessonQuiz;
  order?: number;
  durationMinutes?: number;
}): Promise<LessonResponseDto> => {
  const lesson = await updateLessonUseCase(input);
  clearCacheByPrefix("courses:");
  return toLessonResponse(lesson);
};

export const deleteLessonService = async (input: {
  courseId: string;
  moduleId: string;
  lessonId: string;
}): Promise<{ deleted: boolean }> => {
  const result = await deleteLessonUseCase(input);
  clearCacheByPrefix("courses:");
  return result;
};

export const publishCourseService = async (courseId: string): Promise<CourseResponseDto> => {
  const course = await publishCourseUseCase(courseId);
  clearCacheByPrefix("courses:");
  return toCourseResponse(course);
};

export const unpublishCourseService = async (courseId: string): Promise<CourseResponseDto> => {
  const course = await unpublishCourseUseCase(courseId);
  clearCacheByPrefix("courses:");
  return toCourseResponse(course);
};

export const deleteCourseService = async (courseId: string): Promise<CourseResponseDto> => {
  const course = await deleteCourseUseCase(courseId);
  clearCacheByPrefix("courses:");
  return toCourseResponse(course);
};
