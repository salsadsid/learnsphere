import { AppError } from "../../../shared/errors";
import type { Course } from "../domain/types";
import { createCourse } from "../infra/course-store";

type CreateCourseInput = {
  title: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  instructorId: string;
};

export const createCourseUseCase = (input: CreateCourseInput): Course => {
  if (!input.title.trim()) {
    throw new AppError({
      status: 400,
      title: "Validation Error",
      detail: "Course title is required.",
      type: "https://httpstatuses.com/400",
    });
  }

  return createCourse(input);
};
