import { AppError } from "../../../shared/errors";
import type { Course, CourseModule, Lesson } from "../domain/types";
import { findCourseById, listLessonsByModule, listModulesByCourse } from "../infra/course-store";

type CourseDetail = {
  course: Course;
  modules: Array<{ module: CourseModule; lessons: Lesson[] }>;
};

export const getCourseDetailUseCase = (courseId: string): CourseDetail => {
  const course = findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const modules = listModulesByCourse(courseId).map((moduleItem) => ({
    module: moduleItem,
    lessons: listLessonsByModule(moduleItem.id),
  }));

  return { course, modules };
};
