export type CourseId = string;

export type ModuleId = string;

export type LessonId = string;

export type CourseStatus = "draft" | "published";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type LessonType = "video" | "link" | "text" | "pdf" | "quiz";

export type LessonQuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type LessonQuizQuestion = {
  id: string;
  prompt: string;
  options: LessonQuizOption[];
  multipleCorrect?: boolean;
};

export type LessonQuiz = {
  title?: string;
  passingScore?: number;
  questions: LessonQuizQuestion[];
};

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
  type: LessonType;
  content?: string;
  resourceUrl?: string;
  quiz?: LessonQuiz;
  order: number;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
};
