"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson, authPatchJson, authPostJson } from "@/shared/api";

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
};

type CourseStatusResponse = {
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

type VideoUploadResponse = {
  uploadUrl: string;
  assetUrl: string;
  expiresAt: string;
};

type EditState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CourseDetail };

type FormState = {
  title: string;
  summary: string;
  category: string;
  level: "" | "beginner" | "intermediate" | "advanced";
};

type CourseEditPageProps = {
  params: { courseId: string };
};

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const [state, setState] = useState<EditState>({ status: "loading" });
  const [form, setForm] = useState<FormState>({
    title: "",
    summary: "",
    category: "",
    level: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadResponse, setUploadResponse] = useState<VideoUploadResponse | null>(null);
  const autoSaveTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      const result = await authGetJson<CourseDetail>(`/api/v1/courses/${params.courseId}`);
      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({ status: "error", message: result.error ?? "Unable to load course." });
        return;
      }

      setState({ status: "ready", data: result.data });
      setForm({
        title: result.data.title,
        summary: result.data.summary ?? "",
        category: result.data.category ?? "",
        level: result.data.level ?? "",
      });
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [params.courseId]);

  const isDirty = useMemo(() => {
    if (state.status !== "ready") {
      return false;
    }

    return (
      form.title !== state.data.title ||
      form.summary !== (state.data.summary ?? "") ||
      form.category !== (state.data.category ?? "") ||
      form.level !== (state.data.level ?? "")
    );
  }, [form, state]);

  const updateField = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const buildPayload = useCallback((): Record<string, string> => {
    const payload: Record<string, string> = {};
    if (form.title.trim()) {
      payload.title = form.title.trim();
    }
    if (form.summary.trim()) {
      payload.summary = form.summary.trim();
    }
    if (form.category.trim()) {
      payload.category = form.category.trim();
    }
    if (form.level) {
      payload.level = form.level;
    }

    return payload;
  }, [form]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty) {
      setMessage("No changes to save yet.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = buildPayload();

    const result = await authPatchJson<CourseDetail>(
      `/api/v1/courses/${params.courseId}`,
      payload
    );

    if (!result.ok || !result.data) {
      setSaving(false);
      setMessage(result.error ?? "Unable to update course.");
      return;
    }

    setState({ status: "ready", data: result.data });
    setMessage("Course updated successfully.");
    setSaving(false);
  };

  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    if (!isDirty || saving || statusUpdating) {
      return;
    }

    if (autoSaveTimer.current !== null) {
      window.clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = window.setTimeout(async () => {
      const payload = buildPayload();
      if (Object.keys(payload).length === 0) {
        return;
      }

      setAutoSaving(true);
      const result = await authPatchJson<CourseDetail>(
        `/api/v1/courses/${params.courseId}`,
        payload
      );

      if (result.ok && result.data) {
        setState({ status: "ready", data: result.data });
        setAutoMessage("Draft autosaved just now.");
      }

      setAutoSaving(false);
    }, 1200);

    return () => {
      if (autoSaveTimer.current !== null) {
        window.clearTimeout(autoSaveTimer.current);
      }
    };
  }, [buildPayload, isDirty, params.courseId, saving, state.status, statusUpdating]);

  const handleStatusUpdate = async (nextStatus: "published" | "draft") => {
    if (state.status !== "ready") {
      return;
    }

    setStatusUpdating(true);
    setMessage(null);

    const endpoint = nextStatus === "published" ? "publish" : "unpublish";
    const result = await authPostJson<CourseStatusResponse>(
      `/api/v1/courses/${params.courseId}/${endpoint}`,
      {}
    );

    if (!result.ok || !result.data) {
      setStatusUpdating(false);
      setMessage(result.error ?? "Unable to update course visibility.");
      return;
    }

    setState({
      status: "ready",
      data: {
        ...state.data,
        status: result.data.status,
        updatedAt: result.data.updatedAt,
        title: result.data.title,
        summary: result.data.summary,
        category: result.data.category,
        level: result.data.level,
      },
    });
    setMessage(
      nextStatus === "published"
        ? "Course published successfully."
        : "Course moved back to draft."
    );
    setStatusUpdating(false);
  };

  const handleVideoUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadMessage(null);
    setUploadResponse(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("video") as File | null;

    if (!file) {
      setUploadMessage("Please select a video file.");
      return;
    }

    if (!file.type.startsWith("video/")) {
      setUploadMessage("Unsupported file format. Use MP4 or WebM.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadMessage("File is too large. Max size is 50MB.");
      return;
    }

    const result = await authPostJson<VideoUploadResponse>("/api/v1/videos/upload-url", {
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });

    if (!result.ok || !result.data) {
      setUploadMessage(result.error ?? "Unable to create upload URL.");
      return;
    }

    setUploadResponse(result.data);
    setUploadMessage("Upload URL generated. Use it to upload your video.");
  };

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Edit course</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Update course details
          </h1>
          <Link className="text-sm font-semibold text-slate-900" href={`/courses/${params.courseId}`}>
            Back to course
          </Link>
        </header>

        {state.status === "loading" && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Loading course...
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            {state.message}
          </div>
        )}

        {state.status === "ready" && (
          <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visibility</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {state.data.status === "published" ? "Published" : "Draft"}
                  </p>
                </div>
                {state.data.status === "published" ? (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusUpdate("draft")}
                    className="h-11 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                  >
                    {statusUpdating ? "Updating..." : "Unpublish"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusUpdate("published")}
                    className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {statusUpdating ? "Publishing..." : "Publish"}
                  </button>
                )}
              </div>
            </div>

            <form
              className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 shadow-sm"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-6">
              <label className="grid gap-2 text-sm text-slate-700">
                Course title
                <input
                  className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                  value={form.title}
                  onChange={updateField("title")}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-700">
                Summary
                <textarea
                  className="min-h-[120px] rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm"
                  value={form.summary}
                  onChange={updateField("summary")}
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-700">
                Category
                <input
                  className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
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

              {message && <p className="text-sm text-slate-600">{message}</p>}
              {autoMessage && (
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {autoSaving ? "Saving draft..." : autoMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              </div>
            </form>

            <form
              className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 shadow-sm"
              onSubmit={handleVideoUpload}
            >
              <div className="grid gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video upload</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">Prepare a lesson video</h2>
                </div>
                <input
                  name="video"
                  type="file"
                  accept="video/mp4,video/webm"
                  className="text-sm text-slate-700"
                />
                {uploadMessage && (
                  <p className="text-sm text-slate-600">{uploadMessage}</p>
                )}
                {uploadResponse && (
                  <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    <p>Upload URL: {uploadResponse.uploadUrl}</p>
                    <p>Asset URL: {uploadResponse.assetUrl}</p>
                    <p>Expires: {new Date(uploadResponse.expiresAt).toLocaleString()}</p>
                  </div>
                )}
                <button
                  type="submit"
                  className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Generate upload URL
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
