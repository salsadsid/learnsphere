import { AppError } from "../../../shared/errors";
import type { CourseModule, ModuleId } from "../domain/types";
import { findModuleById, updateModule } from "../infra/course-store";

export const updateModuleUseCase = async (input: {
  courseId: string;
  moduleId: ModuleId;
  title?: string;
  summary?: string;
  order?: number;
}): Promise<CourseModule> => {
  const moduleItem = await findModuleById(input.moduleId);
  if (!moduleItem || moduleItem.courseId !== input.courseId) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Module not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const updated = await updateModule({
    moduleId: input.moduleId,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
  });

  if (!updated) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Module not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  return updated;
};
