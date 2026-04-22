"use client";

import { useState } from "react";
import Link from "next/link";
import { useInstructorSummary, useInstructorCourses } from "@/hooks/use-courses";
import { useInstructorCourseProgress } from "@/hooks/use-progress";
import { authGetText } from "@/shared/api";
import { GlassCard, Pill, SectionHeading } from "@/shared/ui";

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}m ${remainder}s`;
};

export default function InstructorDashboard() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useInstructorSummary();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useInstructorCourses();
  const [userSelectedCourseId, setUserSelectedCourseId] = useState<string | null>(null);

  const selectedCourseId =
    userSelectedCourseId ?? (courses?.items.length ? courses.items[0].id : null);

  const { data: progress, isLoading: progressLoading, error: progressError } = useInstructorCourseProgress(selectedCourseId);

  const isLoading = summaryLoading || coursesLoading;
  const error = summaryError || coursesError;

  const handleDownloadCsv = async () => {
    if (!selectedCourseId) return;

    const result = await authGetText(
      `/api/v1/progress/instructor/course/${selectedCourseId}/export`
    );

    if (!result.ok || !result.data) return;

    const blob = new Blob([result.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `course-progress-${selectedCourseId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <SectionHeading
        eyebrow="Instructor hub"
        title="Your course dashboard"
        description="Track your portfolio, move drafts forward, and monitor learner momentum."
      />

      {isLoading && (
        <GlassCard className="text-sm text-slate-600">Loading instructor dashboard...</GlassCard>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      {summary && courses && (
        <>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              { label: "Total courses", value: summary.totalCourses },
              { label: "Published", value: summary.publishedCourses },
              { label: "Drafts", value: summary.draftCourses },
              { label: "Modules", value: summary.moduleCount },
              { label: "Lessons", value: summary.lessonCount },
            ].map((item) => (
              <GlassCard key={item.label} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
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
              {courses.items.length === 0 ? (
                <p className="text-sm text-slate-600">No courses yet.</p>
              ) : (
                courses.items.map((course) => (
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
                        <p className="mt-1 font-semibold text-slate-900">{course.title}</p>
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Learner progress</p>
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
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Course</label>
              <select
                className="h-10 rounded-full border border-slate-900/10 bg-white px-4 text-sm"
                value={selectedCourseId ?? ""}
                onChange={(e) => setUserSelectedCourseId(e.target.value)}
              >
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {progressLoading && (
              <p className="text-sm text-slate-600">Loading learner progress...</p>
            )}

            {progressError && (
              <p className="text-sm text-rose-600">{progressError.message}</p>
            )}

            {progress && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: "Learners", value: progress.engagement.totalLearners },
                    { label: "Active (7d)", value: progress.engagement.activeLearners },
                    {
                      label: "Avg completion",
                      value: `${progress.engagement.averageCompletionPercent}%`,
                    },
                    {
                      label: "Watch time",
                      value: formatSeconds(progress.engagement.totalWatchTimeSeconds),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4">
                  {progress.students.length === 0 ? (
                    <p className="text-sm text-slate-600">No learner activity yet.</p>
                  ) : (
                    progress.students.map((student) => (
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
  );
}
