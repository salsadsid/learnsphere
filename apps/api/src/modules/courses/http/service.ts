import type { Course, CourseModule, Lesson } from "../domain/types";
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
  listCategories,
  listCourses,
} from "../infra/course-store";
import { createCourseUseCase } from "../use-cases/create-course";
import { createLessonUseCase } from "../use-cases/create-lesson";
import { createModuleUseCase } from "../use-cases/create-module";
import { getCourseDetailUseCase } from "../use-cases/get-course-detail";
import { publishCourseUseCase } from "../use-cases/publish-course";
import { unpublishCourseUseCase } from "../use-cases/unpublish-course";
import { updateCourseUseCase } from "../use-cases/update-course";

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

export const listCoursesService = (input: ListCoursesInput): ListCoursesResponseDto => {
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

  const { items, total } = listCourses(listInput);
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
};

export const listInstructorCoursesService = (
  instructorId: string,
  input: ListCoursesInput
): ListCoursesResponseDto => {
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

  const { items, total } = listCourses(listInput);
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
};

export const getInstructorSummaryService = (instructorId: string): InstructorSummaryResponseDto => {
  const { items } = listCourses({ page: 1, pageSize: Number.MAX_SAFE_INTEGER, instructorId });
  const totalCourses = items.length;
  const publishedCourses = items.filter((course) => course.status === "published").length;
  const draftCourses = items.filter((course) => course.status === "draft").length;

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    moduleCount: countModulesByInstructor(instructorId),
    lessonCount: countLessonsByInstructor(instructorId),
  };
};

export const listCourseCategoriesService = (
  input: ListCategoriesInput
): CourseCategoriesResponseDto => {
  const categories = listCategories({
    ...(input.status !== undefined ? { status: input.status } : {}),
  });

  return { categories };
};

export const getCourseDetailService = (courseId: string): CourseDetailResponseDto => {
  const detail = getCourseDetailUseCase(courseId);

  return {
    ...toCourseResponse(detail.course),
    modules: detail.modules.map((entry) => toModuleResponse(entry.module, entry.lessons)),
  };
};

export const createCourseService = (input: {
  title: string;
  instructorId: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
}): CourseResponseDto => {
  const course = createCourseUseCase(input);
  return toCourseResponse(course);
};

export const updateCourseService = (input: {
  courseId: string;
  title?: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
}): CourseResponseDto => {
  const course = updateCourseUseCase(input);
  return toCourseResponse(course);
};

export const createModuleService = (input: {
  courseId: string;
  title: string;
  summary?: string;
  order?: number;
}): ModuleResponseDto => {
  const moduleItem = createModuleUseCase(input);
  return toModuleResponse(moduleItem, []);
};

export const createLessonService = (input: {
  courseId: string;
  moduleId: string;
  title: string;
  content?: string;
  order?: number;
  durationMinutes?: number;
}): LessonResponseDto => {
  const lesson = createLessonUseCase(input);
  return toLessonResponse(lesson);
};

export const publishCourseService = (courseId: string): CourseResponseDto =>
  toCourseResponse(publishCourseUseCase(courseId));

export const unpublishCourseService = (courseId: string): CourseResponseDto =>
  toCourseResponse(unpublishCourseUseCase(courseId));
