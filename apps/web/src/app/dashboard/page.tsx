"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson, authGetText } from "@/shared/api";

type MeResponse = {
  id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
};

type InstructorSummary = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  moduleCount: number;
  lessonCount: number;
};

type CourseListItem = {
  id: string;
  title: string;
  status: "draft" | "published";
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
};

type CourseListResponse = {
  items: CourseListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
};

type StudentCourseProgress = {
  userId: string;
  email?: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  watchTimeSeconds: number;
  lastActivityAt?: string;
};

type InstructorCourseProgress = {
  courseId: string;
  totalLessons: number;
  students: StudentCourseProgress[];
  engagement: {
    totalLearners: number;
    activeLearners: number;
    totalWatchTimeSeconds: number;
    averageCompletionPercent: number;
  };
};

type ProgressState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: InstructorCourseProgress };

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: InstructorSummary; courses: CourseListResponse };

type StudentCourseSummary = {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  watchTimeSeconds: number;
  lastActivityAt?: string;
};

type StudentDashboardTotals = {
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  watchTimeSeconds: number;
  percentComplete: number;
};

type StudentDashboardResponse = {
  totals: StudentDashboardTotals;
  courses: StudentCourseSummary[];
  updatedAt: string;
};

type StudentDashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: StudentDashboardResponse };

type RoleState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "ready"; role: "student" | "instructor" | "admin"; email: string };

export default function DashboardPage() {
  const [roleState, setRoleState] = useState<RoleState>({ status: "loading" });
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [progressState, setProgressState] = useState<ProgressState>({ status: "idle" });
  const [studentState, setStudentState] = useState<StudentDashboardState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const loadRole = async () => {
      const result = await authGetJson<MeResponse>("/api/v1/auth/me");

      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setRoleState({ status: "guest" });
        return;
      }

      setRoleState({ status: "ready", role: result.data.role, email: result.data.email });
    };

    loadRole();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (roleState.status !== "ready") {
      return;
    }

    if (roleState.role !== "instructor" && roleState.role !== "admin") {
      return;
    }

    let active = true;

    const loadDashboard = async () => {
      const [summaryResult, coursesResult] = await Promise.all([
        authGetJson<InstructorSummary>("/api/v1/courses/instructor/summary"),
        authGetJson<CourseListResponse>("/api/v1/courses/instructor/courses"),
      ]);

      if (!active) {
        return;
      }

      if (!summaryResult.ok || !summaryResult.data) {
        setState({
          status: "error",
          message: summaryResult.error ?? "Unable to load instructor summary.",
        });
        return;
      }

      if (!coursesResult.ok || !coursesResult.data) {
        setState({
          status: "error",
          message: coursesResult.error ?? "Unable to load instructor courses.",
        });
        return;
      }

      setState({
        status: "ready",
        summary: summaryResult.data,
        courses: coursesResult.data,
      });
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [roleState]);

  useEffect(() => {
    if (roleState.status !== "ready") {
      return;
    }

    if (roleState.role !== "student") {
      return;
    }

    let active = true;
    setStudentState({ status: "loading" });

    const loadStudentDashboard = async () => {
      const result = await authGetJson<StudentDashboardResponse>(
        "/api/v1/progress/student/summary"
      );

      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setStudentState({
          status: "error",
          message: result.error ?? "Unable to load your learning dashboard.",
        });
        return;
      }

      setStudentState({ status: "ready", data: result.data });
    };

    loadStudentDashboard();

    return () => {
      active = false;
    };
  }, [roleState]);

  useEffect(() => {
    if (state.status !== "ready" || state.courses.items.length === 0) {
      return;
    }

    if (!selectedCourseId) {
      setSelectedCourseId(state.courses.items[0].id);
    }
  }, [selectedCourseId, state]);

  useEffect(() => {
    if (!selectedCourseId) {
      return;
    }

    let active = true;
    setProgressState({ status: "loading" });

    const loadProgress = async () => {
      const result = await authGetJson<InstructorCourseProgress>(
        `/api/v1/progress/instructor/course/${selectedCourseId}`
      );

      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setProgressState({
          status: "error",
          message: result.error ?? "Unable to load learner progress.",
        });
        return;
      }

      setProgressState({ status: "ready", data: result.data });
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [selectedCourseId]);

  const formatSeconds = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}m ${remainder}s`;
  };

  const handleDownloadCsv = async () => {
    if (!selectedCourseId) {
      return;
    }

    const result = await authGetText(
      `/api/v1/progress/instructor/course/${selectedCourseId}/export`
    );

    if (!result.ok || !result.data) {
      setProgressState({
        status: "error",
        message: result.error ?? "Unable to download report.",
      });
      return;
    }

    const blob = new Blob([result.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `course-progress-${selectedCourseId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStudentCharts = (courses: StudentCourseSummary[]) => {
    if (courses.length === 0) {
      return null;
    }

    const maxWatchTime = Math.max(...courses.map((course) => course.watchTimeSeconds), 1);

    return (
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completion pulse</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Course progress</h3>
          <div className="mt-5 space-y-4">
            {courses.map((course) => (
              <div key={course.courseId}>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{course.courseTitle}</span>
                  <span>{course.percentComplete}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-teal-500"
                    style={{ width: `${course.percentComplete}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Watch time</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Minutes per course</h3>
          <div className="mt-6 flex items-end gap-3">
            {courses.map((course) => {
              const height = Math.round((course.watchTimeSeconds / maxWatchTime) * 120) + 20;
              return (
                <div key={course.courseId} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-2xl bg-amber-200/80" style={{ height }} />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {Math.round(course.watchTimeSeconds / 60)}m
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        {roleState.status === "loading" && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Loading your dashboard...
          </div>
        )}

        {roleState.status === "guest" && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Sign in to view your dashboard.
          </div>
        )}

        {roleState.status === "ready" && roleState.role === "student" && (
          <>
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Learner cockpit</p>
              <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
                Your learning momentum
              </h1>
              <p className="text-sm text-slate-600">
                Track your course progress and time-on-task in one place.
              </p>
              {studentState.status === "ready" && (
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Updated {new Date(studentState.data.updatedAt).toLocaleString()}
                </p>
              )}
            </header>

            {studentState.status === "loading" && (
              <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
                Loading your learning dashboard...
              </div>
            )}

            {studentState.status === "error" && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
                {studentState.message}
              </div>
            )}

            {studentState.status === "ready" && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: "Courses", value: studentState.data.totals.totalCourses },
                    { label: "Lessons", value: studentState.data.totals.totalLessons },
                    { label: "Completed", value: studentState.data.totals.completedLessons },
                    {
                      label: "Watch time",
                      value: `${Math.round(studentState.data.totals.watchTimeSeconds / 60)}m`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {renderStudentCharts(studentState.data.courses)}

                <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Active courses
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Your current focus list
                      </h2>
                    </div>
                    <Link className="text-sm font-semibold text-slate-900" href="/courses">
                      Explore more
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {studentState.data.courses.length === 0 ? (
                      <p className="text-sm text-slate-600">No course activity yet.</p>
                    ) : (
                      studentState.data.courses.map((course) => (
                        <div
                          key={course.courseId}
                          className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {course.courseTitle}
                              </p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {course.completedLessons}/{course.totalLessons} lessons completed
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {course.percentComplete}% complete
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Watch time {formatSeconds(course.watchTimeSeconds)}
                              </p>
                            </div>
                          </div>
                          {course.lastActivityAt && (
                            <p className="mt-2 text-xs text-slate-500">
                              Last activity {new Date(course.lastActivityAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {roleState.status === "ready" && roleState.role !== "student" && (
          <>
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Instructor hub</p>
              <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
                Your course dashboard
              </h1>
              <p className="text-sm text-slate-600">
                Track your course portfolio and keep drafts moving forward.
              </p>
            </header>

            {state.status === "loading" && (
              <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
                Loading instructor dashboard...
              </div>
            )}

            {state.status === "error" && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
                {state.message}
              </div>
            )}

            {state.status === "ready" && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "Total courses",
                      value: state.summary.totalCourses,
                    },
                    {
                      label: "Published",
                      value: state.summary.publishedCourses,
                    },
                    {
                      label: "Drafts",
                      value: state.summary.draftCourses,
                    },
                    {
                      label: "Modules",
                      value: state.summary.moduleCount,
                    },
                    {
                      label: "Lessons",
                      value: state.summary.lessonCount,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Your courses</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Active drafts and published tracks
                      </h2>
                    </div>
                    <Link className="text-sm font-semibold text-slate-900" href="/courses">
                      View catalog
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {state.courses.items.length === 0 ? (
                      <p className="text-sm text-slate-600">No courses yet.</p>
                    ) : (
                      state.courses.items.map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.id}/edit`}
                          className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-900/20"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {course.category ?? "General"}
                              </p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {course.title}
                              </p>
                            </div>
                            <span className="rounded-full border border-slate-900/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                              {course.status}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Learner progress
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Student momentum per course
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      className="h-10 rounded-full border border-slate-900/10 px-4 text-sm font-semibold text-slate-900"
                      disabled={!selectedCourseId}
                    >
                      Export CSV
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Course
                    </label>
                    <select
                      className="h-10 rounded-full border border-slate-900/10 bg-white px-4 text-sm"
                      value={selectedCourseId ?? ""}
                      onChange={(event) => setSelectedCourseId(event.target.value)}
                    >
                      {state.courses.items.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {progressState.status === "loading" && (
                    <p className="mt-6 text-sm text-slate-600">Loading learner progress...</p>
                  )}

                  {progressState.status === "error" && (
                    <p className="mt-6 text-sm text-rose-600">{progressState.message}</p>
                  )}

                  {progressState.status === "ready" && (
                    <>
                      <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                          {
                            label: "Learners",
                            value: progressState.data.engagement.totalLearners,
                          },
                          {
                            label: "Active (7d)",
                            value: progressState.data.engagement.activeLearners,
                          },
                          {
                            label: "Avg completion",
                            value: `${progressState.data.engagement.averageCompletionPercent}%`,
                          },
                          {
                            label: "Watch time",
                            value: formatSeconds(progressState.data.engagement.totalWatchTimeSeconds),
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm"
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 grid gap-4">
                        {progressState.data.students.length === 0 ? (
                          <p className="text-sm text-slate-600">No learner activity yet.</p>
                        ) : (
                          progressState.data.students.map((student) => (
                            <div
                              key={student.userId}
                              className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    {student.email ?? "Unknown learner"}
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-900">
                                    {student.completedLessons}/{student.totalLessons} lessons completed
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    {student.percentComplete}% complete
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Watch time {formatSeconds(student.watchTimeSeconds)}
                                  </p>
                                </div>
                              </div>
                              {student.lastActivityAt && (
                                <p className="mt-2 text-xs text-slate-500">
                                  Last activity {new Date(student.lastActivityAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
