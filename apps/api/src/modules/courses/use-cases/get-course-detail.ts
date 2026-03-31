import { AppError } from "../../../shared/errors";
import type { Course, CourseModule, Lesson } from "../domain/types";
import { findCourseById, listLessonsByModule, listModulesByCourse } from "../infra/course-store";

type CourseDetail = {
  course: Course;
  modules: Array<{ module: CourseModule; lessons: Lesson[] }>;
};

export const getCourseDetailUseCase = async (courseId: string): Promise<CourseDetail> => {
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
  const lessonsByModule = await Promise.all(
    modules.map(async (moduleItem) => ({
      module: moduleItem,
      lessons: await listLessonsByModule(moduleItem.id),
    }))
  );

  return { course, modules: lessonsByModule };
};
