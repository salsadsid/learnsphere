import { AppError } from "../../../shared/errors";
import type { CourseModule } from "../domain/types";
import { createModule, findCourseById } from "../infra/course-store";

type CreateModuleInput = {
  courseId: string;
  title: string;
  summary?: string;
  order?: number;
};

export const createModuleUseCase = (input: CreateModuleInput): CourseModule => {
  const course = findCourseById(input.courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  if (!input.title.trim()) {
    throw new AppError({
      status: 400,
      title: "Validation Error",
      detail: "Module title is required.",
      type: "https://httpstatuses.com/400",
    });
  }

  return createModule(input);
};
