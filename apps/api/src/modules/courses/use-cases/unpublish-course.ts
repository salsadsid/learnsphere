import { AppError } from "../../../shared/errors";
import type { Course } from "../domain/types";
import { findCourseById, updateCourseStatus } from "../infra/course-store";

export const unpublishCourseUseCase = (courseId: string): Course => {
  const existing = findCourseById(courseId);
  if (!existing) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const updated = updateCourseStatus({ courseId, status: "draft" });
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
