"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson, authGetText, authPatchJson, authPostJson } from "@/shared/api";
import { GlassCard, PageShell, Pill, SectionHeading } from "@/shared/ui";

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

type AdminUser = {
  id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  isActive: boolean;
  createdAt: string;
  deactivatedAt?: string;
};

type AdminUserListResponse = {
  items: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
};

type AdminState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminUserListResponse };

type RoleState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "ready"; role: "student" | "instructor" | "admin"; email: string; id: string };

export default function DashboardPage() {
  const [roleState, setRoleState] = useState<RoleState>({ status: "loading" });
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [progressState, setProgressState] = useState<ProgressState>({ status: "idle" });
  const [studentState, setStudentState] = useState<StudentDashboardState>({ status: "loading" });
  const [adminState, setAdminState] = useState<AdminState>({ status: "idle" });
  const [adminQuery, setAdminQuery] = useState("");
  const [adminActiveQuery, setAdminActiveQuery] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState<"all" | "student" | "instructor" | "admin">(
    "all"
  );
  const [adminActiveRole, setAdminActiveRole] = useState<
    "all" | "student" | "instructor" | "admin"
  >("all");
  const [adminStatusFilter, setAdminStatusFilter] = useState<"all" | "active" | "inactive">(
    "active"
  );
  const [adminActiveStatus, setAdminActiveStatus] = useState<"all" | "active" | "inactive">(
    "active"
  );
  const [adminPage, setAdminPage] = useState(1);
  const [adminRefresh, setAdminRefresh] = useState(0);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminBusyUserId, setAdminBusyUserId] = useState<string | null>(null);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUser["role"]>>({});

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

      setRoleState({
        status: "ready",
        role: result.data.role,
        email: result.data.email,
        id: result.data.id,
      });
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
    if (roleState.status !== "ready" || roleState.role !== "admin") {
      return;
    }

    let active = true;
    setAdminState({ status: "loading" });
    setAdminMessage(null);

    const loadAdminUsers = async () => {
      const params = new URLSearchParams();
      params.set("page", String(adminPage));
      params.set("pageSize", "20");
      if (adminActiveQuery.trim()) {
        params.set("q", adminActiveQuery.trim());
      }
      if (adminActiveRole !== "all") {
        params.set("role", adminActiveRole);
      }
      if (adminActiveStatus !== "all") {
        params.set("status", adminActiveStatus);
      }

      const result = await authGetJson<AdminUserListResponse>(
        `/api/v1/admin/users?${params.toString()}`
      );

      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setAdminState({
          status: "error",
          message: result.error ?? "Unable to load users.",
        });
        return;
      }

      setAdminState({ status: "ready", data: result.data });
    };

    loadAdminUsers();

    return () => {
      active = false;
    };
  }, [
    roleState,
    adminPage,
    adminActiveQuery,
    adminActiveRole,
    adminActiveStatus,
    adminRefresh,
  ]);

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

  const handleAdminSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminActiveQuery(adminQuery);
    setAdminActiveRole(adminRoleFilter);
    setAdminActiveStatus(adminStatusFilter);
    setAdminPage(1);
  };

  const handleAdminReset = () => {
    setAdminQuery("");
    setAdminRoleFilter("all");
    setAdminStatusFilter("active");
    setAdminActiveQuery("");
    setAdminActiveRole("all");
    setAdminActiveStatus("active");
    setAdminPage(1);
  };

  const refreshAdminList = () => {
    setAdminRefresh((prev) => prev + 1);
  };

  const handleRoleUpdate = async (userId: string, role: AdminUser["role"]) => {
    setAdminBusyUserId(userId);
    setAdminMessage(null);
    const result = await authPatchJson<AdminUser>(`/api/v1/admin/users/${userId}/role`, {
      role,
    });

    if (!result.ok || !result.data) {
      setAdminBusyUserId(null);
      setAdminMessage(result.error ?? "Unable to update role.");
      return;
    }

    setAdminBusyUserId(null);
    setAdminMessage("Role updated successfully.");
    refreshAdminList();
  };

  const handleStatusUpdate = async (userId: string, nextStatus: "active" | "inactive") => {
    setAdminBusyUserId(userId);
    setAdminMessage(null);
    const result = await authPatchJson<AdminUser>(`/api/v1/admin/users/${userId}/status`, {
      status: nextStatus,
    });

    if (!result.ok || !result.data) {
      setAdminBusyUserId(null);
      setAdminMessage(result.error ?? "Unable to update status.");
      return;
    }

    setAdminBusyUserId(null);
    setAdminMessage(
      nextStatus === "active" ? "User reactivated." : "User deactivated."
    );
    refreshAdminList();
  };

  const handlePasswordReset = async (userId: string) => {
    const nextPassword = (passwordDrafts[userId] ?? "").trim();
    if (nextPassword.length < 8) {
      setAdminMessage("Password must be at least 8 characters.");
      return;
    }

    setAdminBusyUserId(userId);
    setAdminMessage(null);

    const result = await authPostJson<AdminUser>(`/api/v1/admin/users/${userId}/password`, {
      password: nextPassword,
    });

    if (!result.ok || !result.data) {
      setAdminBusyUserId(null);
      setAdminMessage(result.error ?? "Unable to reset password.");
      return;
    }

    setPasswordDrafts((prev) => ({ ...prev, [userId]: "" }));
    setAdminBusyUserId(null);
    setAdminMessage("Password reset successfully.");
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
      <PageShell maxWidth="max-w-7xl" className="gap-8">
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
            <SectionHeading
              eyebrow="Learner cockpit"
              title="Your learning momentum"
              description="Track progress, watch time, and next lessons in one view."
            />
            {studentState.status === "ready" && (
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Updated {new Date(studentState.data.updatedAt).toLocaleString()}
              </p>
            )}

            {studentState.status === "loading" && (
              <GlassCard className="text-sm text-slate-600">
                Loading your learning dashboard...
              </GlassCard>
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
                    <GlassCard key={item.label} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                    </GlassCard>
                  ))}
                </div>

                {renderStudentCharts(studentState.data.courses)}

                <GlassCard className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
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

                  <div className="grid gap-4">
                    {studentState.data.courses.length === 0 ? (
                      <p className="text-sm text-slate-600">No course activity yet.</p>
                    ) : (
                      studentState.data.courses.map((course) => (
                        <div
                          key={course.courseId}
                          className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 text-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                {course.courseTitle}
                              </p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {course.completedLessons}/{course.totalLessons} lessons completed
                              </p>
                            </div>
                            <div className="text-right">
                              <Pill label={`${course.percentComplete}% complete`} tone="success" />
                              <p className="mt-2 text-xs text-slate-500">
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
                </GlassCard>
              </>
            )}

          </>
        )}

        {roleState.status === "ready" && roleState.role === "admin" && (
          <>
            <SectionHeading
              eyebrow="Admin control"
              title="User management"
              description="Manage roles, access, and passwords across the platform."
            />
            <GlassCard className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-5">
                  <form onSubmit={handleAdminSearchSubmit} className="grid gap-3">
                    <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
                      Search email
                      <input
                        className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                        placeholder="Search by email"
                        value={adminQuery}
                        onChange={(event) => setAdminQuery(event.target.value)}
                      />
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
                        Role
                        <select
                          className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                          value={adminRoleFilter}
                          onChange={(event) =>
                            setAdminRoleFilter(
                              event.target.value as "all" | "student" | "instructor" | "admin"
                            )
                          }
                        >
                          <option value="all">All roles</option>
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </label>
                      <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
                        Status
                        <select
                          className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                          value={adminStatusFilter}
                          onChange={(event) =>
                            setAdminStatusFilter(
                              event.target.value as "all" | "active" | "inactive"
                            )
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="all">All</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminReset}
                        className="h-11 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-5 text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin guide</p>
                  <p className="mt-2">
                    Role changes and deactivations take effect immediately. Use strong
                    passwords when resetting access for instructors.
                  </p>
                  {adminMessage && <p className="mt-3 text-sm text-slate-700">{adminMessage}</p>}
                </div>
              </div>

              {adminState.status === "loading" && (
                <p className="text-sm text-slate-600">Loading users...</p>
              )}

              {adminState.status === "error" && (
                <p className="text-sm text-rose-600">{adminState.message}</p>
              )}

              {adminState.status === "ready" && (
                <div className="grid gap-4">
                  {adminState.data.items.length === 0 ? (
                    <p className="text-sm text-slate-600">No users found.</p>
                  ) : (
                    adminState.data.items.map((user) => {
                      const roleValue = roleDrafts[user.id] ?? user.role;
                      const passwordValue = passwordDrafts[user.id] ?? "";
                      const isBusy = adminBusyUserId === user.id;
                      const isSelf = roleState.status === "ready" && roleState.id === user.id;

                      return (
                        <div
                          key={user.id}
                          className="rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-4 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {user.email}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Created {new Date(user.createdAt).toLocaleDateString()}
                                {user.deactivatedAt
                                  ? ` • Deactivated ${new Date(user.deactivatedAt).toLocaleDateString()}`
                                  : ""}
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                                user.isActive
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                              }`}
                            >
                              {user.isActive ? "active" : "inactive"}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_1.1fr_1.3fr]">
                            <div className="grid gap-2">
                              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Role
                              </label>
                              <div className="flex gap-2">
                                <select
                                  className="h-10 flex-1 rounded-full border border-slate-900/10 bg-white px-4 text-sm"
                                  value={roleValue}
                                  onChange={(event) =>
                                    setRoleDrafts((prev) => ({
                                      ...prev,
                                      [user.id]: event.target.value as AdminUser["role"],
                                    }))
                                  }
                                >
                                  <option value="student">Student</option>
                                  <option value="instructor">Instructor</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  type="button"
                                  disabled={isBusy || isSelf || roleValue === user.role}
                                  onClick={() => handleRoleUpdate(user.id, roleValue)}
                                  className="h-10 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                                >
                                  Update
                                </button>
                              </div>
                              {isSelf && (
                                <p className="text-[11px] text-slate-500">
                                  You cannot change your own role.
                                </p>
                              )}
                            </div>

                            <div className="grid gap-2">
                              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Access
                              </label>
                              <button
                                type="button"
                                disabled={isBusy || isSelf}
                                onClick={() =>
                                  handleStatusUpdate(
                                    user.id,
                                    user.isActive ? "inactive" : "active"
                                  )
                                }
                                className="h-10 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                              >
                                {user.isActive ? "Deactivate" : "Reactivate"}
                              </button>
                              {isSelf && (
                                <p className="text-[11px] text-slate-500">
                                  You cannot change your own status.
                                </p>
                              )}
                            </div>

                            <div className="grid gap-2">
                              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Reset password
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="password"
                                  className="h-10 flex-1 rounded-full border border-slate-900/10 bg-white px-4 text-sm"
                                  placeholder="New password"
                                  value={passwordValue}
                                  onChange={(event) =>
                                    setPasswordDrafts((prev) => ({
                                      ...prev,
                                      [user.id]: event.target.value,
                                    }))
                                  }
                                />
                                <button
                                  type="button"
                                  disabled={isBusy || passwordValue.trim().length < 8}
                                  onClick={() => handlePasswordReset(user.id)}
                                  className="h-10 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {adminState.data.totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                      <span>
                        Page {adminState.data.page} of {adminState.data.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAdminPage((prev) => Math.max(1, prev - 1))}
                          disabled={adminState.data.page <= 1}
                          className="h-9 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAdminPage((prev) =>
                              adminState.data.nextPage ? prev + 1 : prev
                            )
                          }
                          disabled={!adminState.data.nextPage}
                          className="h-9 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </>
        )}

        {roleState.status === "ready" && roleState.role !== "student" && (
          <>
            <SectionHeading
              eyebrow="Instructor hub"
              title="Your course dashboard"
              description="Track your portfolio, move drafts forward, and monitor learner momentum."
            />

            {state.status === "loading" && (
              <GlassCard className="text-sm text-slate-600">
                Loading instructor dashboard...
              </GlassCard>
            )}

            {state.status === "error" && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
                {state.message}
              </div>
            )}

            {state.status === "ready" && (
              <>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
                    <GlassCard key={item.label} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Your courses</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Active drafts and published tracks
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                        href="/courses/new"
                      >
                        Create course
                      </Link>
                      <Link
                        className="h-10 rounded-full border border-slate-900/10 px-4 text-sm font-semibold text-slate-900"
                        href="/courses"
                      >
                        View catalog
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {state.courses.items.length === 0 ? (
                      <p className="text-sm text-slate-600">No courses yet.</p>
                    ) : (
                      state.courses.items.map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.id}/edit`}
                          className="rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-900/25"
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
                            <Pill
                              label={course.status}
                              tone={course.status === "published" ? "success" : "warning"}
                            />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="space-y-6">
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

                  <div className="flex flex-wrap items-center gap-3">
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
                    <p className="text-sm text-slate-600">Loading learner progress...</p>
                  )}

                  {progressState.status === "error" && (
                    <p className="text-sm text-rose-600">{progressState.message}</p>
                  )}

                  {progressState.status === "ready" && (
                    <>
                      <div className="grid gap-4 md:grid-cols-4">
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

                      <div className="grid gap-4">
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
                </GlassCard>
              </>
            )}
          </>
        )}
      </PageShell>
    </AuthGuard>
  );
}
