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

export type SaveProgressResponseDto = {
  accepted: boolean;
  record: ProgressResponseDto;
  reason?: "stale" | "equal";
};
