"use client";

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

type GuardState = "checking" | "authorized" | "unauthorized";

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

      clearTokens();
      setState("unauthorized");
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${next}`);
    };

    checkAuth();

    return () => {
      isActive = false;
    };
  }, [pathname, router]);

  if (state !== "authorized") {
    return (
      <div className="flex w-full items-center justify-center py-20 text-sm text-slate-600">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
