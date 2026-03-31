import { AppError } from "../../../shared/errors";
import { findLessonById, deleteLessonById } from "../infra/course-store";

export const deleteLessonUseCase = async (input: {
  courseId: string;
  moduleId: string;
  lessonId: string;
}): Promise<{ deleted: boolean }> => {
  const existing = await findLessonById(input.lessonId);
  if (!existing || existing.courseId !== input.courseId || existing.moduleId !== input.moduleId) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Lesson not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  return deleteLessonById(input.lessonId);
};
