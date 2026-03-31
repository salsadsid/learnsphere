"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/shared/auth-guard";
import { authPostJson } from "@/shared/api";
import { GlassCard, PageShell, Pill, SectionHeading } from "@/shared/ui";

type CreateCourseResponse = {
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

type FormState = {
  title: string;
  summary: string;
  category: string;
  level: "" | "beginner" | "intermediate" | "advanced";
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: "",
    summary: "",
    category: "",
    level: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.title.trim()) {
      setMessage("Course title is required.");
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      ...(form.summary.trim() ? { summary: form.summary.trim() } : {}),
      ...(form.category.trim() ? { category: form.category.trim() } : {}),
      ...(form.level ? { level: form.level } : {}),
    };

    const result = await authPostJson<CreateCourseResponse>("/api/v1/courses", payload);
    if (!result.ok || !result.data) {
      setSaving(false);
      setMessage(result.error ?? "Unable to create course.");
      return;
    }

    router.push(`/courses/${result.data.id}/edit`);
  };

  return (
    <AuthGuard>
      <PageShell maxWidth="max-w-6xl" className="gap-10">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <SectionHeading
            eyebrow="Instructor studio"
            title="Launch a new course"
            description="Set the essentials first. The full builder opens next."
          />
          <GlassCard className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick tips</p>
            <div className="flex flex-wrap gap-2">
              <Pill label="Add modules" tone="accent" />
              <Pill label="Upload videos" tone="warning" />
              <Pill label="Build quizzes" tone="success" />
            </div>
            <p className="text-sm text-slate-600">
              Draft the overview, then craft lessons with mixed formats for higher engagement.
            </p>
          </GlassCard>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <label className="grid gap-2 text-sm text-slate-700">
              Title
              <input
                className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                placeholder="Course title"
                value={form.title}
                onChange={updateField("title")}
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-700">
              Summary
              <textarea
                className="min-h-[120px] rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm"
                placeholder="What will learners achieve?"
                value={form.summary}
                onChange={updateField("summary")}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-700">
                Category
                <input
                  className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                  placeholder="Growth, Design, Leadership"
                  value={form.category}
                  onChange={updateField("category")}
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-700">
                Level
                <select
                  className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                  value={form.level}
                  onChange={updateField("level")}
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>

            {message && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {message}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Creating..." : "Create course"}
              </button>
              <Link className="text-sm font-semibold text-slate-900" href="/dashboard">
                Back to dashboard
              </Link>
            </div>
          </form>
        </GlassCard>
      </PageShell>
    </AuthGuard>
  );
}
