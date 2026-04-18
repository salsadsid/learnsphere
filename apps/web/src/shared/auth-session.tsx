"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

export default function AuthSession() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/login">
        <Button size="sm">Sign in</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{user?.email}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { logout(); window.location.href = "/"; }}
      >
        Sign out
      </Button>
    </div>
  );
}
