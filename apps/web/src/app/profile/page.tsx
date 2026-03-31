"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson } from "@/shared/api";

type ProfileResponse = {
  id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
};

type ProfileState =
  | { status: "loading" }
  | { status: "ready"; data: ProfileResponse }
  | { status: "error"; message: string };

export default function ProfilePage() {
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      const result = await authGetJson<ProfileResponse>("/api/v1/auth/profile");
      if (!isActive) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({ status: "error", message: result.error ?? "Unable to load profile." });
        return;
      }

      setState({ status: "ready", data: result.data });
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Your account profile
          </h1>
          {state.status === "loading" && (
            <p className="mt-4 text-sm text-slate-600">Loading your details...</p>
          )}
          {state.status === "error" && (
            <p className="mt-4 text-sm text-rose-600">{state.message}</p>
          )}
          {state.status === "ready" && (
            <div className="mt-6 grid gap-4 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                <p className="font-semibold text-slate-900">{state.data.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
                <p className="font-semibold text-slate-900">{state.data.role}</p>
              </div>
              <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Joined</p>
                <p className="font-semibold text-slate-900">
                  {new Date(state.data.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
