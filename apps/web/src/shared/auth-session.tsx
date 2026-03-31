"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authGetJson, postJson } from "@/shared/api";
import { clearTokens, getRefreshToken } from "@/shared/auth-storage";

type SessionState = {
  status: "loading" | "guest" | "authenticated";
  email: string;
  role: "student" | "instructor" | "admin";
};

const defaultSession: SessionState = {
  status: "loading",
  email: "",
  role: "student",
};

type MeResponse = {
  id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
};

export default function AuthSession() {
  const [session, setSession] = useState<SessionState>(defaultSession);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      const result = await authGetJson<MeResponse>("/api/v1/auth/me");
      if (!isActive) {
        return;
      }

      if (!result.ok || !result.data) {
        setSession({ status: "guest", email: "", role: "student" });
        return;
      }

      setSession({
        status: "authenticated",
        email: result.data.email,
        role: result.data.role,
      });
    };

    loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSignOut = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await postJson("/api/v1/auth/logout", { refreshToken });
    }

    clearTokens();
    setSession({ status: "guest", email: "", role: "student" });
  };

  const statusLabel =
    session.status === "authenticated" ? `Signed in as ${session.email}` : "Guest session";

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-slate-700">
          {session.status === "loading" ? "Checking session" : statusLabel}
        </span>
      </div>
      {session.status === "authenticated" ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Sign out
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
