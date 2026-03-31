"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson, authPostJson } from "@/shared/api";
import { getDeviceId, getLocalProgress, setLocalProgress } from "@/shared/video-progress";

type ProgressResponse = {
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
  deviceId?: string;
  clientUpdatedAt?: string;
};

type SaveProgressResponse = {
  accepted: boolean;
  record: ProgressResponse;
  reason?: "stale" | "equal";
};

type WatchState = {
  status: "loading" | "ready" | "error";
  message?: string;
};

type WatchPageProps = {
  params: { courseId: string };
};

const videoSource = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function CourseWatchPage({ params }: WatchPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<WatchState>({ status: "loading" });
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<number>(0);

  const videoId = `${params.courseId}-intro`;
  const deviceId = typeof window !== "undefined" ? getDeviceId() : "";

  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      const local = getLocalProgress(videoId);
      const remote = await authGetJson<ProgressResponse>(`/api/v1/progress/${videoId}`);

      if (!active) {
        return;
      }

      if (!remote.ok && remote.status !== 404) {
        setState({ status: "error", message: remote.error ?? "Unable to load progress." });
        return;
      }

      let chosen = local;
      if (remote.ok && remote.data) {
        const remoteUpdated = new Date(remote.data.updatedAt).getTime();
        if (!chosen || remoteUpdated > chosen.updatedAt) {
          chosen = {
            positionSeconds: remote.data.positionSeconds,
            durationSeconds: remote.data.durationSeconds,
            updatedAt: remoteUpdated,
          };
        }
      }

      if (chosen && chosen.positionSeconds > 5) {
        setResumeAt(chosen.positionSeconds);
      }

      setState({ status: "ready" });
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [videoId]);

  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    const interval = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.duration === 0) {
        return;
      }

      const now = Date.now();
      if (now - lastSaved < 8000) {
        return;
      }

      const payload = {
        videoId,
        positionSeconds: video.currentTime,
        durationSeconds: video.duration,
        deviceId,
        clientUpdatedAt: now,
      };

      setLocalProgress(videoId, {
        positionSeconds: video.currentTime,
        durationSeconds: video.duration,
        updatedAt: now,
      });

      const result = await authPostJson<SaveProgressResponse>("/api/v1/progress", payload);
      if (result.ok && result.data) {
        setProgressMessage(result.data.accepted ? "Progress saved." : "Using newer progress." );
      }

      setLastSaved(now);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [deviceId, lastSaved, state.status, videoId]);

  const handleResume = () => {
    if (!videoRef.current || resumeAt === null) {
      return;
    }

    videoRef.current.currentTime = resumeAt;
    videoRef.current.play();
    setResumeAt(null);
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-16 text-sm text-slate-600">
        Loading player...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold text-slate-900">Unable to load video</h1>
        <p className="text-sm text-rose-600">{state.message}</p>
        <Link className="text-sm font-semibold text-slate-900" href={`/courses/${params.courseId}`}>
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video lesson</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Course introduction
          </h1>
          <p className="text-sm text-slate-600">
            Continue your learning journey with this lesson.
          </p>
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${params.courseId}`}>
            Back to course
          </Link>
        </header>

        {resumeAt !== null && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resume</p>
            <p className="mt-2">We saved your place at {Math.floor(resumeAt)} seconds.</p>
            <button
              onClick={handleResume}
              className="mt-4 h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
            >
              Resume playback
            </button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
          <video ref={videoRef} className="w-full rounded-2xl" controls preload="metadata">
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {progressMessage && (
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              {progressMessage}
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
