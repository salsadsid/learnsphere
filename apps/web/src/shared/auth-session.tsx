"use client";

import { useState } from "react";

type SessionState = {
  isAuthenticated: boolean;
  name: string;
  role: "student" | "instructor" | "admin";
};

const defaultSession: SessionState = {
  isAuthenticated: false,
  name: "Guest",
  role: "student",
};

export default function AuthSession() {
  const [session, setSession] = useState<SessionState>(defaultSession);

  const handleToggle = () => {
    if (session.isAuthenticated) {
      setSession(defaultSession);
      return;
    }

    setSession({
      isAuthenticated: true,
      name: "Amina",
      role: "student",
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-slate-700">
          {session.isAuthenticated ? `Signed in as ${session.name}` : "Guest session"}
        </span>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700"
      >
        {session.isAuthenticated ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
