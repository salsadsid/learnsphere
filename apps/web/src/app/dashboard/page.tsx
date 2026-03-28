"use client";

import AuthGuard from "@/shared/auth-guard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Protected</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Your learning dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page is guarded by the client-side auth check and will redirect you to sign
            in when your session expires.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
