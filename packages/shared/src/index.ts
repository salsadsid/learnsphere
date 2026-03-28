export type ISODateString = string;

export type UserId = string;
export type CourseId = string;
export type ModuleId = string;
export type LessonId = string;
export type EnrollmentId = string;

export type UserRole = "student" | "instructor" | "admin";

export type User = {
  id: UserId;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: ISODateString;
};

export type Course = {
  id: CourseId;
  title: string;
  description: string;
  instructorId: UserId;
  createdAt: ISODateString;
};

export type CourseModule = {
  id: ModuleId;
  courseId: CourseId;
  title: string;
  order: number;
};

export type Lesson = {
  id: LessonId;
  moduleId: ModuleId;
  title: string;
  videoUrl: string;
  order: number;
};

export type EnrollmentStatus = "active" | "completed" | "dropped";

export type Enrollment = {
  id: EnrollmentId;
  userId: UserId;
  courseId: CourseId;
  status: EnrollmentStatus;
  createdAt: ISODateString;
};

export type Progress = {
  id: string;
  userId: UserId;
  lessonId: LessonId;
  currentTime: number;
  completed: boolean;
  updatedAt: ISODateString;
};
