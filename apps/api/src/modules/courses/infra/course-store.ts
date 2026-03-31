import { randomUUID } from "crypto";
import type {
  Course,
  CourseId,
  CourseLevel,
  CourseModule,
  CourseStatus,
  Lesson,
  LessonId,
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
  content?: string;
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

const courses: Course[] = [];
const modules: CourseModule[] = [];
const lessons: Lesson[] = [];

export const createCourse = (input: CreateCourseInput): Course => {
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

  courses.push(course);
  return course;
};

export const updateCourse = (input: UpdateCourseInput): Course | undefined => {
  const course = courses.find((item) => item.id === input.courseId);
  if (!course) {
    return undefined;
  }

  if (input.title !== undefined) {
    course.title = input.title;
  }

  if (input.summary !== undefined) {
    course.summary = input.summary;
  }

  if (input.category !== undefined) {
    course.category = input.category;
  }

  if (input.level !== undefined) {
    course.level = input.level;
  }

  course.updatedAt = new Date();
  return course;
};

export const updateCourseStatus = (input: UpdateCourseStatusInput): Course | undefined => {
  const course = courses.find((item) => item.id === input.courseId);
  if (!course) {
    return undefined;
  }

  course.status = input.status;
  course.updatedAt = new Date();
  return course;
};

export const listCourses = (input: ListCoursesInput): ListCoursesResult => {
  let filtered = courses.slice();

  const normalize = (value: string): string => value.toLowerCase().trim();

  if (input.status) {
    filtered = filtered.filter((course) => course.status === input.status);
  }

  if (input.category) {
    const category = normalize(input.category);
    filtered = filtered.filter((course) => course.category?.toLowerCase() === category);
  }

  if (input.instructorId) {
    filtered = filtered.filter((course) => course.instructorId === input.instructorId);
  }

  if (input.q) {
    const term = normalize(input.q);
    filtered = filtered.filter((course) => {
      const haystack = [course.title, course.summary ?? "", course.category ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  const total = filtered.length;
  const start = (input.page - 1) * input.pageSize;
  const items = filtered
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(start, start + input.pageSize);

  return { items, total };
};

export const listCategories = (input: ListCategoriesInput = {}): string[] => {
  const filtered = input.status
    ? courses.filter((course) => course.status === input.status)
    : courses;

  const categories = new Set<string>();
  for (const course of filtered) {
    if (course.category) {
      categories.add(course.category);
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
};

const getNextModuleOrder = (courseId: CourseId): number => {
  const count = modules.filter((item) => item.courseId === courseId).length;
  return count + 1;
};

const getNextLessonOrder = (moduleId: ModuleId): number => {
  const count = lessons.filter((item) => item.moduleId === moduleId).length;
  return count + 1;
};

export const createModule = (input: CreateModuleInput): CourseModule => {
  const now = new Date();
  const moduleItem: CourseModule = {
    id: randomUUID(),
    courseId: input.courseId,
    title: input.title,
    order: input.order ?? getNextModuleOrder(input.courseId),
    createdAt: now,
    updatedAt: now,
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
  };

  modules.push(moduleItem);
  return moduleItem;
};

export const createLesson = (input: CreateLessonInput): Lesson => {
  const now = new Date();
  const lesson: Lesson = {
    id: randomUUID(),
    courseId: input.courseId,
    moduleId: input.moduleId,
    title: input.title,
    order: input.order ?? getNextLessonOrder(input.moduleId),
    createdAt: now,
    updatedAt: now,
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.durationMinutes !== undefined
      ? { durationMinutes: input.durationMinutes }
      : {}),
  };

  lessons.push(lesson);
  return lesson;
};

export const findCourseById = (id: CourseId): Course | undefined =>
  courses.find((course) => course.id === id);

export const findModuleById = (id: ModuleId): CourseModule | undefined =>
  modules.find((moduleItem) => moduleItem.id === id);

export const findLessonById = (id: LessonId): Lesson | undefined =>
  lessons.find((lesson) => lesson.id === id);

export const listModulesByCourse = (courseId: CourseId): CourseModule[] =>
  modules
    .filter((moduleItem) => moduleItem.courseId === courseId)
    .slice()
    .sort((a, b) => a.order - b.order);

export const listLessonsByModule = (moduleId: ModuleId): Lesson[] =>
  lessons
    .filter((lesson) => lesson.moduleId === moduleId)
    .slice()
    .sort((a, b) => a.order - b.order);

export const countLessonsByCourse = (courseId: CourseId): number =>
  lessons.filter((lesson) => lesson.courseId === courseId).length;

export const countModulesByInstructor = (instructorId: string): number => {
  const courseIds = courses
    .filter((course) => course.instructorId === instructorId)
    .map((course) => course.id);
  return modules.filter((moduleItem) => courseIds.includes(moduleItem.courseId)).length;
};

export const countLessonsByInstructor = (instructorId: string): number => {
  const courseIds = courses
    .filter((course) => course.instructorId === instructorId)
    .map((course) => course.id);
  return lessons.filter((lesson) => courseIds.includes(lesson.courseId)).length;
};
