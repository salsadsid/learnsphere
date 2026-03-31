import { AppError } from "../../../shared/errors";
import type { Course } from "../domain/types";
import {
  countLessonsByCourse,
  listModulesByCourse,
  updateCourseStatus,
  findCourseById,
} from "../infra/course-store";

export const publishCourseUseCase = async (courseId: string): Promise<Course> => {
  const course = await findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const modules = await listModulesByCourse(courseId);
  const moduleCount = modules.length;
  const lessonCount = await countLessonsByCourse(courseId);

  if (moduleCount === 0 || lessonCount === 0) {
    throw new AppError({
      status: 400,
      title: "Validation Error",
      detail: "Course must have at least one module and one lesson before publishing.",
      type: "https://httpstatuses.com/400",
    });
  }

  const updated = await updateCourseStatus({ courseId, status: "published" });
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
