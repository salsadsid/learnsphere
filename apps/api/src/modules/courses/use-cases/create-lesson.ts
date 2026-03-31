import { AppError } from "../../../shared/errors";
import type { Lesson } from "../domain/types";
import { createLesson, findCourseById, findModuleById } from "../infra/course-store";

type CreateLessonInput = {
  courseId: string;
  moduleId: string;
  title: string;
  content?: string;
  order?: number;
  durationMinutes?: number;
};

export const createLessonUseCase = (input: CreateLessonInput): Lesson => {
  const course = findCourseById(input.courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const moduleItem = findModuleById(input.moduleId);
  if (!moduleItem || moduleItem.courseId !== input.courseId) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Module not found for this course.",
      type: "https://httpstatuses.com/404",
    });
  }

  if (!input.title.trim()) {
    throw new AppError({
      status: 400,
      title: "Validation Error",
      detail: "Lesson title is required.",
      type: "https://httpstatuses.com/400",
    });
  }

  return createLesson(input);
};
