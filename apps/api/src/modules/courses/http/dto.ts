import type { CourseLevel, CourseStatus } from "../domain/types";

export type CreateCourseRequestDto = {
  title: string;
  summary?: string;
  category?: string;
  level?: CourseLevel;
};

export type CourseResponseDto = {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  level?: CourseLevel;
  status: CourseStatus;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
};

export type ModuleResponseDto = {
  id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  lessons: LessonResponseDto[];
};

export type LessonResponseDto = {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
};

export type CourseDetailResponseDto = CourseResponseDto & {
  modules: ModuleResponseDto[];
};

export type CreateModuleRequestDto = {
  title: string;
  summary?: string;
  order?: number;
};

export type CreateLessonRequestDto = {
  title: string;
  content?: string;
  order?: number;
  durationMinutes?: number;
};

export type UpdateCourseRequestDto = {
  title?: string;
  summary?: string;
  category?: string;
  level?: CourseLevel;
};

export type ListCoursesResponseDto = {
  items: CourseResponseDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
};
