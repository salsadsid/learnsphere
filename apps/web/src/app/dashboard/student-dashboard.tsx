"use client";

import Link from "next/link";
import { useStudentDashboard } from "@/hooks/use-progress";
import { GlassCard, Pill, SectionHeading } from "@/shared/ui";
import type { StudentCourseSummaryDto } from "@learnsphere/shared";

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}m ${remainder}s`;
};

function CompletionCharts({ courses }: { courses: StudentCourseSummaryDto[] }) {
  if (courses.length === 0) return null;

  const maxWatchTime = Math.max(...courses.map((c) => c.watchTimeSeconds), 1);

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
}

export default function StudentDashboard() {
  const { data, isLoading, error } = useStudentDashboard();

  return (
    <>
      <SectionHeading
        eyebrow="Learner cockpit"
        title="Your learning momentum"
        description="Track progress, watch time, and next lessons in one view."
      />

      {data && (
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Updated {new Date(data.updatedAt).toLocaleString()}
        </p>
      )}

      {isLoading && (
        <GlassCard className="text-sm text-slate-600">
          Loading your learning dashboard...
        </GlassCard>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Courses", value: data.totals.totalCourses },
              { label: "Lessons", value: data.totals.totalLessons },
              { label: "Completed", value: data.totals.completedLessons },
              {
                label: "Watch time",
                value: `${Math.round(data.totals.watchTimeSeconds / 60)}m`,
              },
            ].map((item) => (
              <GlassCard key={item.label} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
              </GlassCard>
            ))}
          </div>

          <CompletionCharts courses={data.courses} />

          <GlassCard className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active courses</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Your current focus list
                </h2>
              </div>
              <Link className="text-sm font-semibold text-slate-900" href="/courses">
                Explore more
              </Link>
            </div>

            <div className="grid gap-4">
              {data.courses.length === 0 ? (
                <p className="text-sm text-slate-600">No course activity yet.</p>
              ) : (
                data.courses.map((course) => (
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
  );
}
