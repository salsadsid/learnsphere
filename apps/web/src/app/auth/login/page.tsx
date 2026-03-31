"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { postJson } from "@/shared/api";
import { setTokens } from "@/shared/auth-storage";

type LoginResponse = {
  accessToken: string;
  expiresInSeconds: number;
  refreshToken: string;
};

type LoginFormState = {
  email: string;
  password: string;
};

const defaultForm: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>(defaultForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (!reason) {
      return;
    }

    if (reason === "expired") {
      setMessage("Your session expired. Please sign in again.");
      setStatus("error");
      return;
    }

    if (reason === "forbidden") {
      setMessage("This account does not have access to that page.");
      setStatus("error");
    }
  }, [searchParams]);

  const handleChange = (field: keyof LoginFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const result = await postJson<LoginResponse>("/api/v1/auth/login", form);
    if (!result.ok || !result.data) {
      setStatus("error");
      setMessage(result.error ?? "Login failed.");
      return;
    }

    setTokens({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });

    setStatus("success");
    setMessage("Signed in. Redirecting to your next step.");
    setForm(defaultForm);

    const next = searchParams.get("next");
    if (next) {
      router.push(next);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-16">
      <div className="grid w-full gap-10 rounded-3xl border border-slate-900/10 bg-white/80 p-10 shadow-xl md:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Sign in to your LearnSphere.
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Pick up where you left off and keep your momentum visible across cohorts.
          </p>
          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Need an account?{" "}
            <Link className="font-semibold text-slate-900" href="/auth/register">
              Create one
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
              placeholder="Your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 w-full rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Signing in..." : "Sign in"}
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
