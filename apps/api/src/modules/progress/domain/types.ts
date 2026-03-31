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
