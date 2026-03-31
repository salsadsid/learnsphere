"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson } from "@/shared/api";

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

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: InstructorSummary; courses: CourseListResponse };

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  useEffect(() => {
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
  }, []);

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
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
                <Link
                  className="text-sm font-semibold text-slate-900"
                  href="/courses"
                >
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
          </>
        )}
      </div>
    </AuthGuard>
  );
}
