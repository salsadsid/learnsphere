export type ProgressId = string;

export type ProgressRecord = {
  id: ProgressId;
  userId: string;
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  deviceId?: string;
  updatedAt: Date;
  clientUpdatedAt?: Date;
};

export type LessonCompletionRecord = {
  id: ProgressId;
  userId: string;
  courseId: string;
  lessonId: string;
  completedAt: Date;
};

export type WatchSnapshotRecord = {
  id: ProgressId;
  userId: string;
  courseId: string;
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
  recordedAt: Date;
};

export type VideoEventType = "play" | "pause" | "ended" | "seeked" | "error" | "loaded";

export type VideoEventRecord = {
  id: ProgressId;
  userId: string;
  courseId: string;
  lessonId: string;
  eventType: VideoEventType;
  positionSeconds?: number;
  deviceId?: string;
  createdAt: Date;
};

export type ProgressResponseDto = {
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
  deviceId?: string;
  clientUpdatedAt?: string;
};

export type SaveProgressRequestDto = {
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  deviceId?: string;
  clientUpdatedAt?: number;
};

export type MarkLessonCompleteRequestDto = {
  courseId: string;
  lessonId: string;
};

export type WatchSnapshotRequestDto = {
  courseId: string;
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
};

export type VideoEventRequestDto = {
  courseId: string;
  lessonId: string;
  eventType: VideoEventType;
  positionSeconds?: number;
  deviceId?: string;
};

export type SaveProgressResponseDto = {
  accepted: boolean;
  record: ProgressResponseDto;
  reason?: "stale" | "equal";
};

export type LessonCompletionResponseDto = {
  courseId: string;
  lessonId: string;
  completedAt: string;
};

export type WatchSnapshotResponseDto = {
  courseId: string;
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
  recordedAt: string;
};

export type VideoEventResponseDto = {
  courseId: string;
  lessonId: string;
  eventType: VideoEventType;
  positionSeconds?: number;
  deviceId?: string;
  createdAt: string;
};

export type CourseProgressResponseDto = {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  completedLessonIds: string[];
};

export type StudentCourseProgressDto = {
  userId: string;
  email?: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  watchTimeSeconds: number;
  lastActivityAt?: string;
};

export type InstructorEngagementMetricsDto = {
  totalLearners: number;
  activeLearners: number;
  totalWatchTimeSeconds: number;
  averageCompletionPercent: number;
};

export type InstructorCourseProgressResponseDto = {
  courseId: string;
  totalLessons: number;
  students: StudentCourseProgressDto[];
  engagement: InstructorEngagementMetricsDto;
};

export type StudentCourseSummaryDto = {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  watchTimeSeconds: number;
  lastActivityAt?: string;
};

export type StudentDashboardTotalsDto = {
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  watchTimeSeconds: number;
  percentComplete: number;
};

export type StudentDashboardResponseDto = {
  totals: StudentDashboardTotalsDto;
  courses: StudentCourseSummaryDto[];
  updatedAt: string;
};
