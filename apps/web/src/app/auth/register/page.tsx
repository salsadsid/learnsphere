"use client";

import { useState } from "react";
import Link from "next/link";
import { postJson } from "@/shared/api";

type RegisterResponse = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

type RegisterFormState = {
  email: string;
  password: string;
};

const defaultForm: RegisterFormState = {
  email: "",
  password: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormState>(defaultForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (field: keyof RegisterFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const result = await postJson<RegisterResponse>("/api/v1/auth/register", form);
    if (!result.ok) {
      setStatus("error");
      setMessage(result.error ?? "Registration failed.");
      return;
    }

    setStatus("success");
    setMessage(`Welcome ${result.data?.email}. Your account is ready.`);
    setForm(defaultForm);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-16">
      <div className="grid w-full gap-10 rounded-3xl border border-slate-900/10 bg-white/80 p-10 shadow-xl md:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Start learning</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Create your LearnSphere account.
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Join a cohort, track your progress, and keep your learning momentum visible.
          </p>
          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-900" href="/auth/login">
              Sign in
            </Link>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900/30 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              className="w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900/30 focus:outline-none"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 w-full rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
          {message && (
            <p
              className={`text-sm ${
                status === "error" ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
