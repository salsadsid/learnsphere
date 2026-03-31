import { AppError } from "../../../shared/errors";
import type { Lesson, LessonType } from "../domain/types";
import { findLessonById, updateLesson } from "../infra/course-store";

export const updateLessonUseCase = async (input: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  type: LessonType;
  content?: string;
  resourceUrl?: string;
  quiz?: Lesson["quiz"];
  order?: number;
  durationMinutes?: number;
}): Promise<Lesson> => {
  const existing = await findLessonById(input.lessonId);
  if (!existing || existing.courseId !== input.courseId || existing.moduleId !== input.moduleId) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Lesson not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const unsetFields: string[] = [];
  if (input.type !== "quiz") {
    unsetFields.push("quiz");
  }
  if (input.type === "text" || input.type === "quiz") {
    unsetFields.push("resourceUrl");
  }

  const updated = await updateLesson({
    lessonId: input.lessonId,
    title: input.title,
    type: input.type,
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.resourceUrl !== undefined ? { resourceUrl: input.resourceUrl } : {}),
    ...(input.quiz !== undefined ? { quiz: input.quiz } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
    unsetFields,
  });

  if (!updated) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Lesson not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  return updated;
};
