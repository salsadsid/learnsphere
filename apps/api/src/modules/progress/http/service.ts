import { findCourseById, listLessonsByCourse } from "../../courses/infra/course-store";
import { findUserById } from "../../auth/infra/user-store";
import { listEnrollmentsByUser } from "../../enrollment/infra/enrollment-store";
import type {
  LessonCompletionRecord,
  ProgressRecord,
  VideoEventRecord,
  WatchSnapshotRecord,
} from "../domain/types";
import {
  addVideoEvent,
  addWatchSnapshot,
  findProgress,
  listLessonCompletionsByCourse,
  listLessonCompletionsByCourseAll,
  listWatchSnapshotsByCourse,
  listWatchSnapshotsByCourseAndUser,
  markLessonComplete,
  saveProgress,
} from "../infra/progress-store";
import type {
  CourseProgressResponseDto,
  InstructorCourseProgressResponseDto,
  LessonCompletionResponseDto,
  ProgressResponseDto,
  SaveProgressResponseDto,
  StudentCourseSummaryDto,
  StudentDashboardResponseDto,
  StudentDashboardTotalsDto,
  StudentCourseProgressDto,
  VideoEventResponseDto,
  WatchSnapshotResponseDto,
} from "./dto";
import { clearCacheByPrefix, getOrSetCache } from "../../../shared/cache";
import type { LessonCompletionInput, SaveProgressInput, VideoEventInput, WatchSnapshotInput } from "./validation";

const toProgressResponse = (record: ProgressRecord | undefined): ProgressResponseDto | null => {
  if (!record) {
    return null;
  }

  return {
    videoId: record.videoId,
    positionSeconds: record.positionSeconds,
    durationSeconds: record.durationSeconds,
    updatedAt: record.updatedAt.toISOString(),
    ...(record.deviceId !== undefined ? { deviceId: record.deviceId } : {}),
    ...(record.clientUpdatedAt !== undefined
      ? { clientUpdatedAt: record.clientUpdatedAt.toISOString() }
      : {}),
  };
};

const toCompletionResponse = (
  record: LessonCompletionRecord
): LessonCompletionResponseDto => ({
  courseId: record.courseId,
  lessonId: record.lessonId,
  completedAt: record.completedAt.toISOString(),
});

const toSnapshotResponse = (record: WatchSnapshotRecord): WatchSnapshotResponseDto => ({
  courseId: record.courseId,
  lessonId: record.lessonId,
  positionSeconds: record.positionSeconds,
  durationSeconds: record.durationSeconds,
  recordedAt: record.recordedAt.toISOString(),
});

const toEventResponse = (record: VideoEventRecord): VideoEventResponseDto => ({
  courseId: record.courseId,
  lessonId: record.lessonId,
  eventType: record.eventType,
  createdAt: record.createdAt.toISOString(),
  ...(record.positionSeconds !== undefined ? { positionSeconds: record.positionSeconds } : {}),
  ...(record.deviceId !== undefined ? { deviceId: record.deviceId } : {}),
});

export const getVideoProgressService = async (
  userId: string,
  videoId: string
): Promise<ProgressResponseDto | null> =>
  toProgressResponse(await findProgress(userId, videoId));

export const saveVideoProgressService = async (
  userId: string,
  input: SaveProgressInput
): Promise<SaveProgressResponseDto> => {
  const clientUpdatedAt = input.clientUpdatedAt ? new Date(input.clientUpdatedAt) : undefined;

  const result = await saveProgress({
    userId,
    videoId: input.videoId,
    positionSeconds: input.positionSeconds,
    durationSeconds: input.durationSeconds,
    ...(input.deviceId !== undefined ? { deviceId: input.deviceId } : {}),
    ...(clientUpdatedAt !== undefined ? { clientUpdatedAt } : {}),
  });

  clearCacheByPrefix(`progress:studentSummary:${userId}`);

  return {
    accepted: result.accepted,
    record: toProgressResponse(result.record) as ProgressResponseDto,
    ...(result.reason !== undefined ? { reason: result.reason } : {}),
  };
};

export const markLessonCompleteService = async (
  userId: string,
  input: LessonCompletionInput
): Promise<LessonCompletionResponseDto> => {
  const record = await markLessonComplete({
    userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
  });

  clearCacheByPrefix(`progress:studentSummary:${userId}`);

  return toCompletionResponse(record);
};

export const listLessonCompletionsService = async (
  userId: string,
  courseId: string
): Promise<LessonCompletionResponseDto[]> =>
  (await listLessonCompletionsByCourse(userId, courseId)).map(toCompletionResponse);

export const addWatchSnapshotService = async (
  userId: string,
  input: WatchSnapshotInput
): Promise<WatchSnapshotResponseDto> => {
  const record = await addWatchSnapshot({
    userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    positionSeconds: input.positionSeconds,
    durationSeconds: input.durationSeconds,
  });
  const response = toSnapshotResponse(record);

  clearCacheByPrefix(`progress:studentSummary:${userId}`);

  return response;
};

export const addVideoEventService = async (
  userId: string,
  input: VideoEventInput
): Promise<VideoEventResponseDto> => {
  const record = await addVideoEvent({
    userId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    eventType: input.eventType,
    ...(input.positionSeconds !== undefined ? { positionSeconds: input.positionSeconds } : {}),
    ...(input.deviceId !== undefined ? { deviceId: input.deviceId } : {}),
  });
  const response = toEventResponse(record);

  clearCacheByPrefix(`progress:studentSummary:${userId}`);

  return response;
};

export const getCourseProgressService = async (
  userId: string,
  courseId: string
): Promise<CourseProgressResponseDto> => {
  const lessons = await listLessonsByCourse(courseId);
  const completions = await listLessonCompletionsByCourse(userId, courseId);
  const completedLessonIds = completions.map((record) => record.lessonId);
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id)
  ).length;
  const percentComplete = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return {
    courseId,
    totalLessons,
    completedLessons,
    percentComplete,
    completedLessonIds,
  };
};

export const getInstructorCourseProgressService = async (
  courseId: string
): Promise<InstructorCourseProgressResponseDto> => {
  const lessons = await listLessonsByCourse(courseId);
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const totalLessons = lessons.length;
  const completions = await listLessonCompletionsByCourseAll(courseId);
  const snapshots = await listWatchSnapshotsByCourse(courseId);
  const students = new Map<string, {
    completedLessonIds: Set<string>;
    watchTimeByLesson: Map<string, number>;
    lastActivityAt?: Date;
  }>();

  const ensureStudent = (userId: string) => {
    if (!students.has(userId)) {
      students.set(userId, {
        completedLessonIds: new Set<string>(),
        watchTimeByLesson: new Map<string, number>(),
      });
    }
    return students.get(userId) as {
      completedLessonIds: Set<string>;
      watchTimeByLesson: Map<string, number>;
      lastActivityAt?: Date;
    };
  };

  for (const completion of completions) {
    if (!lessonIds.has(completion.lessonId)) {
      continue;
    }
    const student = ensureStudent(completion.userId);
    student.completedLessonIds.add(completion.lessonId);
    student.lastActivityAt =
      !student.lastActivityAt || completion.completedAt > student.lastActivityAt
        ? completion.completedAt
        : student.lastActivityAt;
  }

  for (const snapshot of snapshots) {
    if (!lessonIds.has(snapshot.lessonId)) {
      continue;
    }
    const student = ensureStudent(snapshot.userId);
    const previous = student.watchTimeByLesson.get(snapshot.lessonId) ?? 0;
    if (snapshot.positionSeconds > previous) {
      student.watchTimeByLesson.set(snapshot.lessonId, snapshot.positionSeconds);
    }
    student.lastActivityAt =
      !student.lastActivityAt || snapshot.recordedAt > student.lastActivityAt
        ? snapshot.recordedAt
        : student.lastActivityAt;
  }

  const studentSummaries: StudentCourseProgressDto[] = await Promise.all(
    Array.from(students.entries()).map(async ([userId, data]) => {
      const completedLessons = data.completedLessonIds.size;
      const percentComplete =
        totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
      let watchTimeSeconds = 0;
      for (const value of data.watchTimeByLesson.values()) {
        watchTimeSeconds += value;
      }
      const user = await findUserById(userId);
      return {
        userId,
        completedLessons,
        totalLessons,
        percentComplete,
        watchTimeSeconds: Math.round(watchTimeSeconds),
        ...(user?.email ? { email: user.email } : {}),
        ...(data.lastActivityAt ? { lastActivityAt: data.lastActivityAt.toISOString() } : {}),
      };
    })
  );

  studentSummaries.sort((a, b) => {
    if (b.percentComplete !== a.percentComplete) {
      return b.percentComplete - a.percentComplete;
    }
    const emailA = a.email ?? "";
    const emailB = b.email ?? "";
    return emailA.localeCompare(emailB);
  });

  const totalLearners = studentSummaries.length;
  const totalWatchTimeSeconds = studentSummaries.reduce(
    (sum, entry) => sum + entry.watchTimeSeconds,
    0
  );
  const averageCompletionPercent =
    totalLearners === 0
      ? 0
      : Math.round(
          studentSummaries.reduce((sum, entry) => sum + entry.percentComplete, 0) /
            totalLearners
        );
  const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeLearners = studentSummaries.filter((entry) => {
    if (!entry.lastActivityAt) {
      return false;
    }
    return new Date(entry.lastActivityAt).getTime() >= recentThreshold;
  }).length;

  return {
    courseId,
    totalLessons,
    students: studentSummaries,
    engagement: {
      totalLearners,
      activeLearners,
      totalWatchTimeSeconds,
      averageCompletionPercent,
    },
  };
};

const STUDENT_DASHBOARD_TTL_MS = 30_000;

const buildStudentSummaryCacheKey = (userId: string): string =>
  `progress:studentSummary:${userId}`;

const buildStudentCourseSummary = async (
  userId: string,
  courseId: string
): Promise<StudentCourseSummaryDto | null> => {
  const course = await findCourseById(courseId);
  if (!course) {
    return null;
  }

  const lessons = await listLessonsByCourse(courseId);
  const completions = await listLessonCompletionsByCourse(userId, courseId);
  const snapshots = await listWatchSnapshotsByCourseAndUser(courseId, userId);
  const completedLessonIds = new Set(completions.map((record) => record.lessonId));
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const percentComplete = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const watchTimeByLesson = new Map<string, number>();
  let lastActivityAt: Date | undefined;

  for (const completion of completions) {
    lastActivityAt = !lastActivityAt || completion.completedAt > lastActivityAt
      ? completion.completedAt
      : lastActivityAt;
  }

  for (const snapshot of snapshots) {
    const previous = watchTimeByLesson.get(snapshot.lessonId) ?? 0;
    if (snapshot.positionSeconds > previous) {
      watchTimeByLesson.set(snapshot.lessonId, snapshot.positionSeconds);
    }
    lastActivityAt = !lastActivityAt || snapshot.recordedAt > lastActivityAt
      ? snapshot.recordedAt
      : lastActivityAt;
  }

  let watchTimeSeconds = 0;
  for (const value of watchTimeByLesson.values()) {
    watchTimeSeconds += value;
  }

  return {
    courseId,
    courseTitle: course.title,
    totalLessons,
    completedLessons,
    percentComplete,
    watchTimeSeconds: Math.round(watchTimeSeconds),
    ...(lastActivityAt ? { lastActivityAt: lastActivityAt.toISOString() } : {}),
  };
};

export const getStudentDashboardService = async (
  userId: string
): Promise<StudentDashboardResponseDto> => {
  const cacheKey = buildStudentSummaryCacheKey(userId);

  return getOrSetCache(cacheKey, STUDENT_DASHBOARD_TTL_MS, async () => {
    const enrollments = await listEnrollmentsByUser(userId);
    const courses: StudentCourseSummaryDto[] = [];

    for (const enrollment of enrollments) {
      const summary = await buildStudentCourseSummary(userId, enrollment.courseId);
      if (summary) {
        courses.push(summary);
      }
    }

    courses.sort((a, b) => {
      if (a.lastActivityAt && b.lastActivityAt) {
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      }
      if (a.lastActivityAt) {
        return -1;
      }
      if (b.lastActivityAt) {
        return 1;
      }
      return a.courseTitle.localeCompare(b.courseTitle);
    });

    const totals = courses.reduce<StudentDashboardTotalsDto>(
      (acc, course) => {
        acc.totalCourses += 1;
        acc.totalLessons += course.totalLessons;
        acc.completedLessons += course.completedLessons;
        acc.watchTimeSeconds += course.watchTimeSeconds;
        return acc;
      },
      {
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        watchTimeSeconds: 0,
        percentComplete: 0,
      }
    );

    totals.percentComplete = totals.totalLessons === 0
      ? 0
      : Math.round((totals.completedLessons / totals.totalLessons) * 100);

    return {
      totals,
      courses,
      updatedAt: new Date().toISOString(),
    };
  });
};

const escapeCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const buildInstructorCourseProgressCsv = (
  input: InstructorCourseProgressResponseDto
): string => {
  const header = [
    "email",
    "userId",
    "completedLessons",
    "totalLessons",
    "percentComplete",
    "watchTimeSeconds",
    "lastActivityAt",
  ];

  const rows = input.students.map((student) => [
    escapeCsv(student.email ?? ""),
    escapeCsv(student.userId),
    String(student.completedLessons),
    String(student.totalLessons),
    String(student.percentComplete),
    String(student.watchTimeSeconds),
    escapeCsv(student.lastActivityAt ?? ""),
  ]);

  return [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
};
