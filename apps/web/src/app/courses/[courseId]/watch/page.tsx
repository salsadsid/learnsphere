"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

type Lesson = {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
};

type Module = {
  id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  lessons: Lesson[];
};

type CourseDetail = {
  id: string;
  title: string;
  summary?: string;
  status: "draft" | "published";
  modules: Module[];
};

type CourseProgress = {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  completedLessonIds: string[];
};

type EnrollmentStatus = {
  enrolled: boolean;
  access: "owner" | "enrolled" | "none";
};

type EnrollmentResponse = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
};

type LessonCompletionResponse = {
  courseId: string;
  lessonId: string;
  completedAt: string;
};

type WatchSnapshotResponse = {
  courseId: string;
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
  recordedAt: string;
};

type VideoEventResponse = {
  courseId: string;
  lessonId: string;
  eventType: "play" | "pause" | "ended" | "seeked" | "error" | "loaded";
  createdAt: string;
  positionSeconds?: number;
  deviceId?: string;
};

type FlattenedLesson = Lesson & {
  moduleTitle: string;
  moduleOrder: number;
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
  const saveMetaRef = useRef({
    lastSavedAt: 0,
    lastPosition: 0,
    inFlight: false,
    lastSnapshotAt: 0,
  });
  const searchParams = useSearchParams();
  const [state, setState] = useState<WatchState>({ status: "loading" });
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [accessStatus, setAccessStatus] = useState<EnrollmentStatus | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionSaving, setCompletionSaving] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const requestedLessonId = searchParams.get("lessonId");
  const lessons = useMemo<FlattenedLesson[]>(() => {
    if (!course) {
      return [];
    }

    return course.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((moduleItem) =>
        moduleItem.lessons
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((lesson) => ({
            ...lesson,
            moduleTitle: moduleItem.title,
            moduleOrder: moduleItem.order,
          }))
      );
  }, [course]);

  const currentLesson = useMemo(() => {
    if (lessons.length === 0) {
      return null;
    }

    if (requestedLessonId) {
      const match = lessons.find((lesson) => lesson.id === requestedLessonId);
      return match ?? lessons[0];
    }

    return lessons[0];
  }, [lessons, requestedLessonId]);

  const currentLessonIndex = useMemo(() => {
    if (!currentLesson) {
      return -1;
    }

    return lessons.findIndex((lesson) => lesson.id === currentLesson.id);
  }, [currentLesson, lessons]);

  const previousLesson =
    currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

  const videoId = currentLesson?.id ?? `${params.courseId}-intro`;
  const deviceId = typeof window !== "undefined" ? getDeviceId() : "";
  const hasAccess = accessStatus?.access === "owner" || accessStatus?.access === "enrolled";

  const trackEvent = async (
    eventType: VideoEventResponse["eventType"],
    positionOverride?: number
  ) => {
    if (!currentLesson) {
      return;
    }

    const positionSeconds =
      positionOverride ?? (videoRef.current ? videoRef.current.currentTime : undefined);

    await authPostJson<VideoEventResponse>("/api/v1/progress/events", {
      courseId: params.courseId,
      lessonId: currentLesson.id,
      eventType,
      ...(positionSeconds !== undefined ? { positionSeconds } : {}),
      ...(deviceId ? { deviceId } : {}),
    });
  };


  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      const result = await authGetJson<CourseDetail>(`/api/v1/courses/${params.courseId}`);

      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({ status: "error", message: result.error ?? "Unable to load course." });
        return;
      }

      setCourse(result.data);
      setState({ status: "ready" });

      const progressResult = await authGetJson<CourseProgress>(
        `/api/v1/progress/course/${params.courseId}`
      );

      const enrollmentResult = await authGetJson<EnrollmentStatus>(
        `/api/v1/enrollments/${params.courseId}`
      );

      if (!active) {
        return;
      }

      if (progressResult.ok && progressResult.data) {
        setCourseProgress(progressResult.data);
        setCompletedLessonIds(progressResult.data.completedLessonIds);
      }

      if (enrollmentResult.ok && enrollmentResult.data) {
        setAccessStatus(enrollmentResult.data);
      } else if (enrollmentResult.status === 401) {
        setAccessStatus({ enrolled: false, access: "none" });
      }
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [params.courseId]);

  useEffect(() => {
    if (state.status !== "ready" || !currentLesson || !hasAccess) {
      return;
    }

    let active = true;
    setResumeAt(null);
    setProgressMessage(null);
    setCompletionMessage(null);
    setPlayerError(null);
    saveMetaRef.current.lastSavedAt = 0;
    saveMetaRef.current.lastPosition = 0;
    saveMetaRef.current.inFlight = false;
    saveMetaRef.current.lastSnapshotAt = 0;

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
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [hasAccess, state.status, videoId]);

  useEffect(() => {
    if (state.status !== "ready" || !currentLesson || !hasAccess) {
      return;
    }

    const interval = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.duration === 0) {
        return;
      }

      const meta = saveMetaRef.current;
      const now = Date.now();
      const positionSeconds = video.currentTime;
      const durationSeconds = video.duration;

      if (now - meta.lastSnapshotAt > 15000) {
        meta.lastSnapshotAt = now;
        await authPostJson<WatchSnapshotResponse>("/api/v1/progress/snapshots", {
          courseId: params.courseId,
          lessonId: currentLesson.id,
          positionSeconds,
          durationSeconds,
        });
      }

      const timeSinceSave = now - meta.lastSavedAt;
      const positionDelta = Math.abs(positionSeconds - meta.lastPosition);
      const shouldSave =
        !meta.inFlight &&
        (timeSinceSave > 12000 || (timeSinceSave > 8000 && positionDelta > 5));

      if (!shouldSave) {
        return;
      }

      meta.inFlight = true;
      meta.lastSavedAt = now;
      meta.lastPosition = positionSeconds;

      const payload = {
        videoId,
        positionSeconds,
        durationSeconds,
        deviceId,
        clientUpdatedAt: now,
      };

      setLocalProgress(videoId, {
        positionSeconds,
        durationSeconds,
        updatedAt: now,
      });

      setProgressMessage("Saving...");

      const result = await authPostJson<SaveProgressResponse>("/api/v1/progress", payload);
      if (result.ok && result.data) {
        setProgressMessage(result.data.accepted ? "Progress saved." : "Using newer progress.");
      } else if (!result.ok) {
        setProgressMessage(result.error ?? "Unable to save progress.");
      }
      meta.inFlight = false;
    }, 4000);

    return () => window.clearInterval(interval);
  }, [currentLesson, deviceId, hasAccess, params.courseId, state.status, videoId]);

  const handleResume = () => {
    if (!videoRef.current || resumeAt === null) {
      return;
    }

    videoRef.current.currentTime = resumeAt;
    videoRef.current.play();
    setResumeAt(null);
  };

  const handleVideoLoaded = () => {
    setPlayerError(null);
    trackEvent("loaded");
  };

  const handleVideoPlay = () => {
    trackEvent("play");
  };

  const handleVideoPause = () => {
    trackEvent("pause");
  };

  const handleVideoSeeked = () => {
    trackEvent("seeked");
  };

  const handleVideoEnded = async () => {
    await trackEvent("ended");
    handleMarkComplete();
  };

  const handleVideoError = () => {
    setPlayerError("Video failed to load. Check your connection and retry.");
    trackEvent("error");
  };

  const handleRetry = () => {
    setPlayerError(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) {
      return;
    }

    if (completedLessonIds.includes(currentLesson.id)) {
      setCompletionMessage("Lesson already completed.");
      return;
    }

    setCompletionSaving(true);
    setCompletionMessage(null);

    const previousCompleted = completedLessonIds;
    const previousProgress = courseProgress;
    const optimisticCompleted = [...completedLessonIds, currentLesson.id];
    setCompletedLessonIds(optimisticCompleted);
    setCourseProgress((prev) => {
      if (!prev) {
        return prev;
      }

      const nextCompleted = prev.completedLessons + 1;
      const nextPercent =
        prev.totalLessons === 0 ? 0 : Math.round((nextCompleted / prev.totalLessons) * 100);

      return {
        ...prev,
        completedLessons: nextCompleted,
        percentComplete: nextPercent,
        completedLessonIds: prev.completedLessonIds.includes(currentLesson.id)
          ? prev.completedLessonIds
          : [...prev.completedLessonIds, currentLesson.id],
      };
    });

    const result = await authPostJson<LessonCompletionResponse>(
      "/api/v1/progress/completions",
      {
        courseId: params.courseId,
        lessonId: currentLesson.id,
      }
    );

    if (!result.ok || !result.data) {
      setCompletedLessonIds(previousCompleted);
      setCourseProgress(previousProgress);
      setCompletionMessage(result.error ?? "Unable to mark lesson complete.");
      setCompletionSaving(false);
      return;
    }

    setCompletionMessage("Lesson completed.");
    setCompletionSaving(false);
  };

  const handleEnroll = async () => {
    if (!course) {
      return;
    }

    setAccessMessage(null);
    setIsEnrolling(true);

    const result = await authPostJson<EnrollmentResponse>("/api/v1/enrollments", {
      courseId: course.id,
    });

    if (!result.ok || !result.data) {
      setAccessMessage(result.error ?? "Unable to enroll.");
      setIsEnrolling(false);
      return;
    }

    setAccessStatus({ enrolled: true, access: "enrolled" });
    setAccessMessage("Enrollment confirmed.");
    setIsEnrolling(false);
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

  if (!course || !currentLesson) {
    return (
      <AuthGuard>
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-16">
          <h1 className="text-2xl font-semibold text-slate-900">No lessons available</h1>
          <p className="text-sm text-slate-600">
            Add lessons to this course before starting playback.
          </p>
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${params.courseId}`}>
            Back to course
          </Link>
        </div>
      </AuthGuard>
    );
  }

  if (!accessStatus) {
    return (
      <AuthGuard>
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-16 text-sm text-slate-600">
          Checking enrollment...
        </div>
      </AuthGuard>
    );
  }

  if (accessStatus && !hasAccess) {
    return (
      <AuthGuard>
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-16">
          <h1 className="text-2xl font-semibold text-slate-900">Enrollment required</h1>
          <p className="text-sm text-slate-600">
            Enroll in {course.title} to unlock video lessons.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
            >
              Enroll now
            </button>
            <Link className="text-sm font-semibold text-slate-900" href={`/courses/${params.courseId}`}>
              Back to course
            </Link>
          </div>
          {accessMessage && (
            <p className="text-xs uppercase tracking-[0.2em] text-rose-600">{accessMessage}</p>
          )}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video lesson</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            {currentLesson.title}
          </h1>
          <p className="text-sm text-slate-600">{course.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>Module {currentLesson.moduleOrder}: {currentLesson.moduleTitle}</span>
            <span>Lesson {currentLesson.order}</span>
            {courseProgress && (
              <span>
                Progress {courseProgress.completedLessons}/{courseProgress.totalLessons} (
                {courseProgress.percentComplete}%)
              </span>
            )}
          </div>
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${params.courseId}`}>
            Back to course
          </Link>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          {previousLesson ? (
            <Link
              className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-900"
              href={`/courses/${params.courseId}/watch?lessonId=${previousLesson.id}`}
            >
              Previous lesson
            </Link>
          ) : (
            <span className="rounded-full border border-slate-900/10 px-4 py-2 text-sm text-slate-400">
              Previous lesson
            </span>
          )}
          {nextLesson ? (
            <Link
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              href={`/courses/${params.courseId}/watch?lessonId=${nextLesson.id}`}
            >
              Next lesson
            </Link>
          ) : (
            <span className="rounded-full border border-slate-900/10 px-4 py-2 text-sm text-slate-400">
              Next lesson
            </span>
          )}
        </div>

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
          <video
            ref={videoRef}
            className="w-full rounded-2xl"
            controls
            preload="metadata"
            onLoadedMetadata={handleVideoLoaded}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onSeeked={handleVideoSeeked}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          >
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {progressMessage && (
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              {progressMessage}
            </p>
          )}
          {playerError && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p>{playerError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-3 h-9 rounded-full bg-rose-600 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Retry video
              </button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={completionSaving || completedLessonIds.includes(currentLesson.id)}
              className="h-10 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {completedLessonIds.includes(currentLesson.id) ? "Lesson completed" : "Mark lesson complete"}
            </button>
            {completionMessage && (
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {completionMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
