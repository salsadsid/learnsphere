type LocalProgress = {
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: number;
};

const deviceKey = "learnsphere-device-id";
const progressKeyPrefix = "learnsphere-video-progress";

const ensureDeviceId = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(deviceKey);
  if (existing) {
    return existing;
  }

  const next = `device-${crypto.randomUUID()}`;
  window.localStorage.setItem(deviceKey, next);
  return next;
};

export const getDeviceId = (): string => ensureDeviceId();

export const getLocalProgress = (videoId: string): LocalProgress | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(`${progressKeyPrefix}:${videoId}`);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as LocalProgress;
    if (
      typeof parsed.positionSeconds !== "number" ||
      typeof parsed.durationSeconds !== "number" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const setLocalProgress = (videoId: string, progress: LocalProgress): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${progressKeyPrefix}:${videoId}`, JSON.stringify(progress));
};

export const clearLocalProgress = (videoId: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(`${progressKeyPrefix}:${videoId}`);
};
