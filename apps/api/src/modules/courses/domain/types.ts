export type CourseId = string;

export type ModuleId = string;

export type LessonId = string;

export type CourseStatus = "draft" | "published";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type Course = {
  id: CourseId;
  title: string;
  summary?: string;
  category?: string;
  level?: CourseLevel;
  status: CourseStatus;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseModule = {
  id: ModuleId;
  courseId: CourseId;
  title: string;
  summary?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Lesson = {
  id: LessonId;
  courseId: CourseId;
  moduleId: ModuleId;
  title: string;
  content?: string;
  order: number;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
};
