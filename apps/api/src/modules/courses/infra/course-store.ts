import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";
import type {
  Course,
  CourseId,
  CourseLevel,
  CourseModule,
  CourseStatus,
  Lesson,
  LessonId,
  LessonQuiz,
  LessonType,
  ModuleId,
} from "../domain/types";

type CreateCourseInput = {
  title: string;
  summary?: string;
  category?: string;
  level?: CourseLevel;
  instructorId: string;
};

type ListCoursesInput = {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  instructorId?: string;
  status?: CourseStatus;
};

type ListCoursesResult = {
  items: Course[];
  total: number;
};

type ListCategoriesInput = {
  status?: CourseStatus;
};

type CreateModuleInput = {
  courseId: CourseId;
  title: string;
  summary?: string;
  order?: number;
};

type CreateLessonInput = {
  courseId: CourseId;
  moduleId: ModuleId;
  title: string;
  type: LessonType;
  content?: string;
  resourceUrl?: string;
  quiz?: LessonQuiz;
  order?: number;
  durationMinutes?: number;
};

type UpdateCourseInput = {
  courseId: CourseId;
  title?: string;
  summary?: string;
  category?: string;
  level?: CourseLevel;
};

type UpdateCourseStatusInput = {
  courseId: CourseId;
  status: CourseStatus;
};

type UpdateModuleInput = {
  moduleId: ModuleId;
  title?: string;
  summary?: string;
  order?: number;
};

type UpdateLessonInput = {
  lessonId: LessonId;
  title?: string;
  type?: LessonType;
  content?: string;
  resourceUrl?: string;
  quiz?: LessonQuiz;
  order?: number;
  durationMinutes?: number;
  unsetFields?: string[];
};

type DeleteLessonResult = {
  deleted: boolean;
};

type DeleteCourseResult = {
  deleted: boolean;
};

const CourseSchema = new Schema<Course>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    summary: { type: String },
    category: { type: String, index: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    status: { type: String, required: true, enum: ["draft", "published"], index: true },
    instructorId: { type: String, required: true, index: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const ModuleSchema = new Schema<CourseModule>(
  {
    id: { type: String, required: true, unique: true, index: true },
    courseId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String },
    order: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const QuizOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuizQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    options: { type: [QuizOptionSchema], required: true },
    multipleCorrect: { type: Boolean },
  },
  { _id: false }
);

const LessonQuizSchema = new Schema(
  {
    title: { type: String },
    passingScore: { type: Number },
    questions: { type: [QuizQuestionSchema], required: true },
  },
  { _id: false }
);

const LessonSchema = new Schema<Lesson>(
  {
    id: { type: String, required: true, unique: true, index: true },
    courseId: { type: String, required: true, index: true },
    moduleId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["video", "link", "text", "pdf", "quiz"],
      default: "text",
    },
    content: { type: String },
    resourceUrl: { type: String },
    quiz: { type: LessonQuizSchema },
    order: { type: Number, required: true },
    durationMinutes: { type: Number },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const CourseModel =
  (mongoose.models.Course as mongoose.Model<Course> | undefined) ??
  mongoose.model<Course>("Course", CourseSchema);
const ModuleModel =
  (mongoose.models.CourseModule as mongoose.Model<CourseModule> | undefined) ??
  mongoose.model<CourseModule>("CourseModule", ModuleSchema);
const LessonModel =
  (mongoose.models.Lesson as mongoose.Model<Lesson> | undefined) ??
  mongoose.model<Lesson>("Lesson", LessonSchema);

const normalize = (value: string): string => value.toLowerCase().trim();

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createCourse = async (input: CreateCourseInput): Promise<Course> => {
  const now = new Date();
  const course: Course = {
    id: randomUUID(),
    title: input.title,
    status: "draft",
    instructorId: input.instructorId,
    createdAt: now,
    updatedAt: now,
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.level !== undefined ? { level: input.level } : {}),
  };

  await CourseModel.create(course);
  return course;
};

export const updateCourse = async (input: UpdateCourseInput): Promise<Course | undefined> => {
  const updates: Partial<Course> = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.level !== undefined ? { level: input.level } : {}),
    updatedAt: new Date(),
  };

  const updated = await CourseModel.findOneAndUpdate(
    { id: input.courseId },
    { $set: updates },
    { new: true }
  )
    .select("-__v -_id")
    .lean<Course>()
    .exec();

  return updated ?? undefined;
};

export const updateCourseStatus = async (
  input: UpdateCourseStatusInput
): Promise<Course | undefined> => {
  const updated = await CourseModel.findOneAndUpdate(
    { id: input.courseId },
    { $set: { status: input.status, updatedAt: new Date() } },
    { new: true }
  )
    .select("-__v -_id")
    .lean<Course>()
    .exec();

  return updated ?? undefined;
};

export const updateModule = async (
  input: UpdateModuleInput
): Promise<CourseModule | undefined> => {
  const updates: Partial<CourseModule> = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    updatedAt: new Date(),
  };

  const updated = await ModuleModel.findOneAndUpdate(
    { id: input.moduleId },
    { $set: updates },
    { new: true }
  )
    .select("-__v -_id")
    .lean<CourseModule>()
    .exec();

  return updated ?? undefined;
};

export const updateLesson = async (
  input: UpdateLessonInput
): Promise<Lesson | undefined> => {
  const updates: Partial<Lesson> = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.resourceUrl !== undefined ? { resourceUrl: input.resourceUrl } : {}),
    ...(input.quiz !== undefined ? { quiz: input.quiz } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.durationMinutes !== undefined
      ? { durationMinutes: input.durationMinutes }
      : {}),
    updatedAt: new Date(),
  };

  const unsetDoc: Record<string, 1> = {};
  if (input.unsetFields && input.unsetFields.length > 0) {
    for (const field of input.unsetFields) {
      unsetDoc[field] = 1;
    }
  }

  const updated = await LessonModel.findOneAndUpdate(
    { id: input.lessonId },
    {
      $set: updates,
      ...(Object.keys(unsetDoc).length > 0 ? { $unset: unsetDoc } : {}),
    },
    { new: true }
  )
    .select("-__v -_id")
    .lean<Lesson>()
    .exec();

  return updated ?? undefined;
};

export const listCourses = async (input: ListCoursesInput): Promise<ListCoursesResult> => {
  const query: mongoose.FilterQuery<Course> = {};

  if (input.status) {
    query.status = input.status;
  }

  if (input.category) {
    const category = escapeRegex(input.category.trim());
    query.category = new RegExp(`^${category}$`, "i");
  }

  if (input.instructorId) {
    query.instructorId = input.instructorId;
  }

  if (input.q) {
    const term = escapeRegex(normalize(input.q));
    const regex = new RegExp(term, "i");
    query.$or = [{ title: regex }, { summary: regex }, { category: regex }];
  }

  const total = await CourseModel.countDocuments(query).exec();
  const items = await CourseModel.find(query)
    .sort({ createdAt: -1 })
    .skip((input.page - 1) * input.pageSize)
    .limit(input.pageSize)
    .select("-__v -_id")
    .lean<Course[]>()
    .exec();

  return { items, total };
};

export const listCategories = async (input: ListCategoriesInput = {}): Promise<string[]> => {
  const query: mongoose.FilterQuery<Course> = {};
  if (input.status) {
    query.status = input.status;
  }

  const categories = (await CourseModel.distinct("category", query).exec()) as unknown[];
  return categories
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .sort((a, b) => a.localeCompare(b));
};

const getNextModuleOrder = async (courseId: CourseId): Promise<number> => {
  const count = await ModuleModel.countDocuments({ courseId }).exec();
  return count + 1;
};

const getNextLessonOrder = async (moduleId: ModuleId): Promise<number> => {
  const count = await LessonModel.countDocuments({ moduleId }).exec();
  return count + 1;
};

export const createModule = async (input: CreateModuleInput): Promise<CourseModule> => {
  const now = new Date();
  const moduleItem: CourseModule = {
    id: randomUUID(),
    courseId: input.courseId,
    title: input.title,
    order: input.order ?? (await getNextModuleOrder(input.courseId)),
    createdAt: now,
    updatedAt: now,
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
  };

  await ModuleModel.create(moduleItem);
  return moduleItem;
};

export const createLesson = async (input: CreateLessonInput): Promise<Lesson> => {
  const now = new Date();
  const lesson: Lesson = {
    id: randomUUID(),
    courseId: input.courseId,
    moduleId: input.moduleId,
    title: input.title,
    type: input.type,
    order: input.order ?? (await getNextLessonOrder(input.moduleId)),
    createdAt: now,
    updatedAt: now,
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.resourceUrl !== undefined ? { resourceUrl: input.resourceUrl } : {}),
    ...(input.quiz !== undefined ? { quiz: input.quiz } : {}),
    ...(input.durationMinutes !== undefined
      ? { durationMinutes: input.durationMinutes }
      : {}),
  };

  await LessonModel.create(lesson);
  return lesson;
};

export const findCourseById = async (id: CourseId): Promise<Course | undefined> => {
  const course = await CourseModel.findOne({ id }).select("-__v -_id").lean<Course>().exec();
  return course ?? undefined;
};

export const findModuleById = async (id: ModuleId): Promise<CourseModule | undefined> => {
  const moduleItem = await ModuleModel.findOne({ id })
    .select("-__v -_id")
    .lean<CourseModule>()
    .exec();
  return moduleItem ?? undefined;
};

export const findLessonById = async (id: LessonId): Promise<Lesson | undefined> => {
  const lesson = await LessonModel.findOne({ id }).select("-__v -_id").lean<Lesson>().exec();
  return lesson ?? undefined;
};

export const listModulesByCourse = async (courseId: CourseId): Promise<CourseModule[]> =>
  ModuleModel.find({ courseId })
    .sort({ order: 1 })
    .select("-__v -_id")
    .lean<CourseModule[]>()
    .exec();

export const listLessonsByModule = async (moduleId: ModuleId): Promise<Lesson[]> =>
  LessonModel.find({ moduleId })
    .sort({ order: 1 })
    .select("-__v -_id")
    .lean<Lesson[]>()
    .exec();

export const listLessonsByCourse = async (courseId: CourseId): Promise<Lesson[]> => {
  const modules = await ModuleModel.find({ courseId })
    .select("id order -_id")
    .lean<Array<Pick<CourseModule, "id" | "order">>>()
    .exec();

  const moduleOrder = new Map<ModuleId, number>();
  for (const moduleItem of modules) {
    moduleOrder.set(moduleItem.id, moduleItem.order);
  }

  const lessons: Lesson[] = await LessonModel.find({ courseId })
    .select("-__v -_id")
    .lean<Lesson[]>()
    .exec();

  return lessons
    .slice()
    .sort((a, b) => {
      const moduleA = moduleOrder.get(a.moduleId) ?? 0;
      const moduleB = moduleOrder.get(b.moduleId) ?? 0;
      if (moduleA !== moduleB) {
        return moduleA - moduleB;
      }
      return a.order - b.order;
    });
};

export const countLessonsByCourse = async (courseId: CourseId): Promise<number> =>
  LessonModel.countDocuments({ courseId }).exec();

export const countModulesByInstructor = async (instructorId: string): Promise<number> => {
  const courses = await CourseModel.find({ instructorId })
    .select("id -_id")
    .lean<Array<Pick<Course, "id">>>()
    .exec();

  if (courses.length === 0) {
    return 0;
  }

  const courseIds = courses.map((course) => course.id);
  return ModuleModel.countDocuments({ courseId: { $in: courseIds } }).exec();
};

export const countLessonsByInstructor = async (instructorId: string): Promise<number> => {
  const courses = await CourseModel.find({ instructorId })
    .select("id -_id")
    .lean<Array<Pick<Course, "id">>>()
    .exec();

  if (courses.length === 0) {
    return 0;
  }

  const courseIds = courses.map((course) => course.id);
  return LessonModel.countDocuments({ courseId: { $in: courseIds } }).exec();
};

export const deleteCourseById = async (courseId: CourseId): Promise<DeleteCourseResult> => {
  const courseResult = await CourseModel.deleteOne({ id: courseId }).exec();
  if (courseResult.deletedCount === 0) {
    return { deleted: false };
  }

  await ModuleModel.deleteMany({ courseId }).exec();
  await LessonModel.deleteMany({ courseId }).exec();
  return { deleted: true };
};

export const deleteLessonById = async (lessonId: LessonId): Promise<DeleteLessonResult> => {
  const result = await LessonModel.deleteOne({ id: lessonId }).exec();
  return { deleted: result.deletedCount > 0 };
};
