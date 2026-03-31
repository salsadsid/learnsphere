"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authGetJson } from "@/shared/api";
import { clearTokens } from "@/shared/auth-storage";

type MeResponse = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

type GuardState = "checking" | "authorized" | "unauthorized" | "forbidden";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [state, setState] = useState<GuardState>("checking");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isActive = true;

    const checkAuth = async () => {
      const result = await authGetJson<MeResponse>("/api/v1/auth/me");
      if (!isActive) {
        return;
      }

      if (result.ok) {
        setState("authorized");
        return;
      }

      if (result.status === 403) {
        setState("forbidden");
        return;
      }

      clearTokens();
      setState("unauthorized");
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      const reason = "reason=expired";
      const separator = next ? "&" : "?";
      router.replace(`/auth/login${next}${separator}${reason}`);
    };

    checkAuth();

    return () => {
      isActive = false;
    };
  }, [pathname, router]);

  if (state === "checking") {
    return (
      <div className="flex w-full items-center justify-center py-20 text-sm text-slate-600">
        Checking your session...
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-20 text-sm text-slate-700">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Access denied</p>
        <h2 className="text-2xl font-semibold text-slate-900 font-[var(--font-display)]">
          You do not have permission to view this page.
        </h2>
        <p className="text-sm text-slate-600">
          If you believe this is a mistake, sign in with the correct account.
        </p>
        <Link className="text-sm font-semibold text-slate-900" href="/auth/login">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (state === "unauthorized") {
    return (
      <div className="flex w-full items-center justify-center py-20 text-sm text-slate-600">
        Redirecting to sign in...
      </div>
    );
  }

  return <>{children}</>;
}
