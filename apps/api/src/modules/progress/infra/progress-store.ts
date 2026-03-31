import { randomUUID } from "crypto";
import type { ProgressRecord } from "../domain/types";

const progressRecords: ProgressRecord[] = [];

type SaveProgressInput = {
  userId: string;
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  deviceId?: string;
  clientUpdatedAt?: Date;
};

type SaveProgressResult = {
  record: ProgressRecord;
  accepted: boolean;
  reason?: "stale" | "equal";
};

export const findProgress = (userId: string, videoId: string): ProgressRecord | undefined =>
  progressRecords.find((record) => record.userId === userId && record.videoId === videoId);

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
