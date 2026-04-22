"use client";

import { useState } from "react";
import Link from "next/link";
import { useCourses, useCategories } from "@/hooks/use-courses";
import { GlassCard, PageShell, Pill, SectionHeading } from "@/shared/ui";

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("published");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [activeQuery, setActiveQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | "draft" | "published">("published");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories(statusFilter);
  const { data, isLoading, error } = useCourses({
    q: activeQuery || undefined,
    status: activeStatus !== "all" ? activeStatus : undefined,
    category: activeCategory !== "all" ? activeCategory : undefined,
    page,
  });

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(query);
    setActiveStatus(statusFilter);
    setActiveCategory(categoryFilter);
    setPage(1);
  };

  const handleReset = () => {
    setQuery("");
    setStatusFilter("published");
    setCategoryFilter("all");
    setActiveQuery("");
    setActiveStatus("published");
    setActiveCategory("all");
    setPage(1);
  };

  return (
    <PageShell maxWidth="max-w-7xl" className="gap-12">
      <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <SectionHeading
          eyebrow="Course catalog"
          title="Explore courses built like product launches"
          description="Discover curated learning tracks with studio-grade lessons and immersive UX."
        />
        <GlassCard className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Catalog focus</p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Live cohorts" tone="accent" />
            <Pill label="Project labs" tone="warning" />
            <Pill label="Starter tracks" tone="success" />
          </div>
          <p className="text-sm text-slate-600">
            Every course includes quizzes, lesson resources, and momentum checkpoints.
          </p>
        </GlassCard>
      </section>

      <GlassCard>
        <form
          className="grid gap-4 md:grid-cols-[1.3fr_0.5fr_0.7fr_auto] md:items-end"
          onSubmit={handleSearchSubmit}
        >
          <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
            Search courses
            <input
              className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
              placeholder="Search by title, topic, or skill"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
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
          <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
            Category
            <select
              className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {(categories?.categories ?? []).map((category) => (
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
      </GlassCard>

      {isLoading && (
        <GlassCard className="text-sm text-slate-600">Loading courses...</GlassCard>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.items.length === 0 ? (
              <GlassCard className="text-sm text-slate-600">
                No courses are available yet.
              </GlassCard>
            ) : (
              data.items.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] transition hover:-translate-y-2 hover:border-cyan-200/60"
                >
                  <div className="flex items-center justify-between">
                    <Pill label={course.category ?? "General"} tone="accent" />
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {course.status}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-slate-900 group-hover:text-slate-800">
                    {course.title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    {course.summary ?? "Build momentum with focused learning modules."}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                    <span>Level {course.level ?? "intro"}</span>
                    <span>Open now</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={data.page <= 1}
                className="h-9 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
              >
                Previous
              </button>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => (data.nextPage ? prev + 1 : prev))}
                disabled={!data.nextPage}
                className="h-9 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
