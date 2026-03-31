import { AppError } from "../../../shared/errors";
import type { Course } from "../domain/types";
import { deleteCourseById, findCourseById } from "../infra/course-store";

export const deleteCourseUseCase = async (courseId: string): Promise<Course> => {
  const existing = await findCourseById(courseId);
  if (!existing) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const result = await deleteCourseById(courseId);
  if (!result.deleted) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  return existing;
};
