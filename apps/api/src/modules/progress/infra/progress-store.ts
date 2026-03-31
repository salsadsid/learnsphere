import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";
import type {
  LessonCompletionRecord,
  ProgressRecord,
  VideoEventRecord,
  VideoEventType,
  WatchSnapshotRecord,
} from "../domain/types";

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

const ProgressSchema = new Schema<ProgressRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    videoId: { type: String, required: true, index: true },
    positionSeconds: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    deviceId: { type: String },
    updatedAt: { type: Date, required: true },
    clientUpdatedAt: { type: Date },
  },
  { versionKey: false }
);

ProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const LessonCompletionSchema = new Schema<LessonCompletionRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    completedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

LessonCompletionSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

const WatchSnapshotSchema = new Schema<WatchSnapshotRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    positionSeconds: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    recordedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const VideoEventSchema = new Schema<VideoEventRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ["play", "pause", "ended", "seeked", "error", "loaded"],
    },
    positionSeconds: { type: Number },
    deviceId: { type: String },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const ProgressModel =
  (mongoose.models.ProgressRecord as mongoose.Model<ProgressRecord> | undefined) ??
  mongoose.model<ProgressRecord>("ProgressRecord", ProgressSchema);
const LessonCompletionModel =
  (mongoose.models.LessonCompletionRecord as mongoose.Model<LessonCompletionRecord> | undefined) ??
  mongoose.model<LessonCompletionRecord>("LessonCompletionRecord", LessonCompletionSchema);
const WatchSnapshotModel =
  (mongoose.models.WatchSnapshotRecord as mongoose.Model<WatchSnapshotRecord> | undefined) ??
  mongoose.model<WatchSnapshotRecord>("WatchSnapshotRecord", WatchSnapshotSchema);
const VideoEventModel =
  (mongoose.models.VideoEventRecord as mongoose.Model<VideoEventRecord> | undefined) ??
  mongoose.model<VideoEventRecord>("VideoEventRecord", VideoEventSchema);

export const findProgress = async (
  userId: string,
  videoId: string
): Promise<ProgressRecord | undefined> => {
  const record = await ProgressModel.findOne({ userId, videoId })
    .select("-__v -_id")
    .lean<ProgressRecord>()
    .exec();
  return record ?? undefined;
};

export const findLessonCompletion = async (
  userId: string,
  lessonId: string
): Promise<LessonCompletionRecord | undefined> => {
  const record = await LessonCompletionModel.findOne({ userId, lessonId })
    .select("-__v -_id")
    .lean<LessonCompletionRecord>()
    .exec();
  return record ?? undefined;
};

export const listLessonCompletionsByCourse = async (
  userId: string,
  courseId: string
): Promise<LessonCompletionRecord[]> =>
  LessonCompletionModel.find({ userId, courseId })
    .sort({ completedAt: -1 })
    .select("-__v -_id")
    .lean<LessonCompletionRecord[]>()
    .exec();

export const listLessonCompletionsByCourseAll = async (
  courseId: string
): Promise<LessonCompletionRecord[]> =>
  LessonCompletionModel.find({ courseId })
    .sort({ completedAt: -1 })
    .select("-__v -_id")
    .lean<LessonCompletionRecord[]>()
    .exec();

export const addWatchSnapshot = async (input: AddSnapshotInput): Promise<WatchSnapshotRecord> => {
  const record: WatchSnapshotRecord = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    positionSeconds: input.positionSeconds,
    durationSeconds: input.durationSeconds,
    recordedAt: new Date(),
  };

  await WatchSnapshotModel.create(record);
  return record;
};

export const listWatchSnapshotsByCourse = async (
  courseId: string
): Promise<WatchSnapshotRecord[]> =>
  WatchSnapshotModel.find({ courseId })
    .sort({ recordedAt: -1 })
    .select("-__v -_id")
    .lean<WatchSnapshotRecord[]>()
    .exec();

export const listWatchSnapshotsByCourseAndUser = async (
  courseId: string,
  userId: string
): Promise<WatchSnapshotRecord[]> =>
  WatchSnapshotModel.find({ courseId, userId })
    .sort({ recordedAt: -1 })
    .select("-__v -_id")
    .lean<WatchSnapshotRecord[]>()
    .exec();

export const addVideoEvent = async (input: AddEventInput): Promise<VideoEventRecord> => {
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

  await VideoEventModel.create(record);
  return record;
};

export const markLessonComplete = async (
  input: MarkLessonCompleteInput
): Promise<LessonCompletionRecord> => {
  const existing = await LessonCompletionModel.findOne({
    userId: input.userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
  })
    .select("-__v -_id")
    .lean<LessonCompletionRecord>()
    .exec();

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

  try {
    await LessonCompletionModel.create(record);
    return record;
  } catch (error) {
    const retry = await LessonCompletionModel.findOne({
      userId: input.userId,
      courseId: input.courseId,
      lessonId: input.lessonId,
    })
      .select("-__v -_id")
      .lean<LessonCompletionRecord>()
      .exec();

    if (retry) {
      return retry;
    }

    throw error;
  }
};

export const saveProgress = async (input: SaveProgressInput): Promise<SaveProgressResult> => {
  const now = new Date();
  const existing = await ProgressModel.findOne({ userId: input.userId, videoId: input.videoId }).exec();

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

    await ProgressModel.create(record);
    return { record, accepted: true };
  }

  if (input.clientUpdatedAt && input.clientUpdatedAt < existing.updatedAt) {
    const record = existing.toObject({ versionKey: false }) as ProgressRecord & { _id?: unknown };
    delete record._id;
    return { record, accepted: false, reason: "stale" };
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

  await existing.save();

  const record = existing.toObject({ versionKey: false }) as ProgressRecord & { _id?: unknown };
  delete record._id;
  return {
    record,
    accepted: true,
    ...(input.clientUpdatedAt === existing.updatedAt ? { reason: "equal" } : {}),
  };
};
