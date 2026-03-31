"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJson } from "@/shared/api";

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
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
};

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CourseDetail };

type CourseDetailPageProps = {
  params: { courseId: string };
};

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const [state, setState] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      const result = await getJson<CourseDetail>(`/api/v1/courses/${params.courseId}`);
      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({ status: "error", message: result.error ?? "Unable to load course." });
        return;
      }

      setState({ status: "ready", data: result.data });
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [params.courseId]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-16 text-sm text-slate-600">
        Loading course...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course</p>
        <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
          Course not available
        </h1>
        <p className="text-sm text-rose-600">{state.message}</p>
        <Link className="text-sm font-semibold text-slate-900" href="/courses">
          Back to courses
        </Link>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>{data.category ?? "General"}</span>
          <span className="rounded-full border border-slate-900/10 px-3 py-1">{data.status}</span>
        </div>
        <h1 className="text-4xl font-semibold text-slate-900 font-[var(--font-display)]">
          {data.title}
        </h1>
        <p className="text-sm text-slate-600">
          {data.summary ?? "A guided track built to help you build momentum."}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>Level: {data.level ?? "intro"}</span>
          <span>{data.modules.length} modules</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${data.id}/edit`}>
            Edit course
          </Link>
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${data.id}/watch`}>
            Watch intro
          </Link>
        </div>
      </header>

      <section className="space-y-6">
        {data.modules.length === 0 ? (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            No modules have been added yet.
          </div>
        ) : (
          data.modules.map((moduleItem) => (
            <div
              key={moduleItem.id}
              className="rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Module {moduleItem.order}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {moduleItem.title}
                  </h2>
                  {moduleItem.summary && (
                    <p className="mt-2 text-sm text-slate-600">{moduleItem.summary}</p>
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {moduleItem.lessonCount} lessons
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                {moduleItem.lessons.length === 0 ? (
                  <p className="text-sm text-slate-500">No lessons yet.</p>
                ) : (
                  moduleItem.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {lesson.order}. {lesson.title}
                        </p>
                        {lesson.durationMinutes !== undefined && (
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {lesson.durationMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
