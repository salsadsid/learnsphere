import { AppError } from "../../../shared/errors";
import type { Course } from "../domain/types";
import { findCourseById, updateCourse } from "../infra/course-store";

type UpdateCourseInput = {
  courseId: string;
  title?: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
};

export const updateCourseUseCase = async (input: UpdateCourseInput): Promise<Course> => {
  if (
    input.title === undefined &&
    input.summary === undefined &&
    input.category === undefined &&
    input.level === undefined
  ) {
    throw new AppError({
      status: 400,
      title: "Validation Error",
      detail: "At least one field is required to update a course.",
      type: "https://httpstatuses.com/400",
    });
  }

  const existing = await findCourseById(input.courseId);
  if (!existing) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const updated = await updateCourse(input);
  if (!updated) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  return updated;
};
