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

type CategoryResponse = {
  categories: string[];
};

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CourseListResponse };

export default function CoursesPage() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">(
    "published"
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | "draft" | "published">(
    "published"
  );
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      const statusParam = statusFilter === "all" ? "" : `?status=${statusFilter}`;
      const result = await getJson<CategoryResponse>(`/api/v1/courses/categories${statusParam}`);
      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setCategories([]);
        return;
      }

      setCategories(result.data.categories);
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, [statusFilter]);

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      const params = new URLSearchParams();
      if (activeQuery.trim()) {
        params.set("q", activeQuery.trim());
      }
      if (activeStatus !== "all") {
        params.set("status", activeStatus);
      }
      if (activeCategory !== "all") {
        params.set("category", activeCategory);
      }

      const path = params.toString()
        ? `/api/v1/courses?${params.toString()}`
        : "/api/v1/courses";

      const result = await getJson<CourseListResponse>(path);
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
  }, [activeQuery, activeStatus, activeCategory]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(query);
    setActiveStatus(statusFilter);
    setActiveCategory(categoryFilter);
  };

  const handleReset = () => {
    setQuery("");
    setStatusFilter("published");
    setCategoryFilter("all");
    setActiveQuery("");
    setActiveStatus("published");
    setActiveCategory("all");
  };

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

      <form
        className="flex flex-col gap-3 rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-sm md:flex-row md:items-end"
        onSubmit={handleSearchSubmit}
      >
        <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
          Search
          <input
            className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
            placeholder="Search courses"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm text-slate-700 md:w-56">
          Status
          <select
            className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "draft" | "published")
            }
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="all">All</option>
          </select>
        </label>
        <label className="flex w-full flex-col gap-2 text-sm text-slate-700 md:w-64">
          Category
          <select
            className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="h-11 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30"
          >
            Reset
          </button>
        </div>
      </form>

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
