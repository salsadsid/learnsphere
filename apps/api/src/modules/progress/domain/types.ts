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
