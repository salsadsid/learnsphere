import { randomUUID } from "crypto";
import type {
  LessonCompletionRecord,
  ProgressRecord,
  VideoEventRecord,
  VideoEventType,
  WatchSnapshotRecord,
} from "../domain/types";

const progressRecords: ProgressRecord[] = [];
const completionRecords: LessonCompletionRecord[] = [];
const snapshotRecords: WatchSnapshotRecord[] = [];
const eventRecords: VideoEventRecord[] = [];

type SaveProgressInput = {
  userId: string;
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  deviceId?: string;
  clientUpdatedAt?: Date;
};

type MarkLessonCompleteInput = {
  userId: string;
  courseId: string;
  lessonId: string;
};

type AddSnapshotInput = {
  userId: string;
  courseId: string;
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
};

type AddEventInput = {
  userId: string;
  courseId: string;
  lessonId: string;
  eventType: VideoEventType;
  positionSeconds?: number;
  deviceId?: string;
};

type SaveProgressResult = {
  record: ProgressRecord;
  accepted: boolean;
  reason?: "stale" | "equal";
};

export const findProgress = (userId: string, videoId: string): ProgressRecord | undefined =>
  progressRecords.find((record) => record.userId === userId && record.videoId === videoId);

export const findLessonCompletion = (
  userId: string,
  lessonId: string
): LessonCompletionRecord | undefined =>
  completionRecords.find((record) => record.userId === userId && record.lessonId === lessonId);

export const listLessonCompletionsByCourse = (
  userId: string,
  courseId: string
): LessonCompletionRecord[] =>
  completionRecords.filter(
    (record) => record.userId === userId && record.courseId === courseId
  );

export const listLessonCompletionsByCourseAll = (courseId: string): LessonCompletionRecord[] =>
  completionRecords.filter((record) => record.courseId === courseId);

export const addWatchSnapshot = (input: AddSnapshotInput): WatchSnapshotRecord => {
  const record: WatchSnapshotRecord = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    positionSeconds: input.positionSeconds,
    durationSeconds: input.durationSeconds,
    recordedAt: new Date(),
  };

  snapshotRecords.push(record);
  return record;
};

export const listWatchSnapshotsByCourse = (courseId: string): WatchSnapshotRecord[] =>
  snapshotRecords.filter((record) => record.courseId === courseId);

export const listWatchSnapshotsByCourseAndUser = (
  courseId: string,
  userId: string
): WatchSnapshotRecord[] =>
  snapshotRecords.filter(
    (record) => record.courseId === courseId && record.userId === userId
  );

export const addVideoEvent = (input: AddEventInput): VideoEventRecord => {
  const record: VideoEventRecord = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    eventType: input.eventType,
    createdAt: new Date(),
    ...(input.positionSeconds !== undefined ? { positionSeconds: input.positionSeconds } : {}),
    ...(input.deviceId !== undefined ? { deviceId: input.deviceId } : {}),
  };

  eventRecords.push(record);
  return record;
};

export const markLessonComplete = (input: MarkLessonCompleteInput): LessonCompletionRecord => {
  const existing = completionRecords.find(
    (record) =>
      record.userId === input.userId &&
      record.courseId === input.courseId &&
      record.lessonId === input.lessonId
  );

  if (existing) {
    return existing;
  }

  const record: LessonCompletionRecord = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    completedAt: new Date(),
  };

  completionRecords.push(record);
  return record;
};

export const saveProgress = (input: SaveProgressInput): SaveProgressResult => {
  const now = new Date();
  const existing = findProgress(input.userId, input.videoId);

  if (!existing) {
    const record: ProgressRecord = {
      id: randomUUID(),
      userId: input.userId,
      videoId: input.videoId,
      positionSeconds: input.positionSeconds,
      durationSeconds: input.durationSeconds,
      updatedAt: now,
      ...(input.deviceId !== undefined ? { deviceId: input.deviceId } : {}),
      ...(input.clientUpdatedAt !== undefined
        ? { clientUpdatedAt: input.clientUpdatedAt }
        : {}),
    };

    progressRecords.push(record);
    return { record, accepted: true };
  }

  if (input.clientUpdatedAt && input.clientUpdatedAt < existing.updatedAt) {
    return { record: existing, accepted: false, reason: "stale" };
  }

  const nextPosition =
    input.positionSeconds < existing.positionSeconds && input.clientUpdatedAt === existing.updatedAt
      ? existing.positionSeconds
      : input.positionSeconds;

  existing.positionSeconds = nextPosition;
  existing.durationSeconds = input.durationSeconds;
  existing.updatedAt = now;
  if (input.deviceId !== undefined) {
    existing.deviceId = input.deviceId;
  }
  if (input.clientUpdatedAt !== undefined) {
    existing.clientUpdatedAt = input.clientUpdatedAt;
  }

  return {
    record: existing,
    accepted: true,
    ...(input.clientUpdatedAt === existing.updatedAt ? { reason: "equal" } : {}),
  };
};
