"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJson } from "@/shared/api";

type CourseListItem = {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
  instructorId: string;
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

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CourseListResponse };

export default function CoursesPage() {
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      const result = await getJson<CourseListResponse>("/api/v1/courses");
      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({ status: "error", message: result.error ?? "Unable to load courses." });
        return;
      }

      setState({ status: "ready", data: result.data });
    };

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course catalog</p>
        <h1 className="text-4xl font-semibold text-slate-900 font-[var(--font-display)]">
          Browse active courses
        </h1>
        <p className="text-sm text-slate-600">
          Explore the latest learning tracks curated by instructors.
        </p>
      </header>

      {state.status === "loading" && (
        <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-10 text-sm text-slate-600">
          Loading courses...
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-sm text-rose-700">
          {state.message}
        </div>
      )}

      {state.status === "ready" && (
        <div className="grid gap-6 md:grid-cols-2">
          {state.data.items.length === 0 ? (
            <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-10 text-sm text-slate-600">
              No courses are available yet.
            </div>
          ) : (
            state.data.items.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-900/20"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                  <span>{course.category ?? "General"}</span>
                  <span className="rounded-full border border-slate-900/10 px-3 py-1">
                    {course.status}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900 group-hover:text-slate-800">
                  {course.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {course.summary ?? "Build momentum with focused learning modules."}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Level: {course.level ?? "intro"}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
