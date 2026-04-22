"use client";

import AuthGuard from "@/shared/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { PageShell } from "@/shared/ui";
import StudentDashboard from "./student-dashboard";
import InstructorDashboard from "./instructor-dashboard";
import AdminDashboard from "./admin-dashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  return (
    <AuthGuard>
      <PageShell maxWidth="max-w-7xl" className="gap-8">
        {isLoading && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Loading your dashboard...
          </div>
        )}

        {!isLoading && !user && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Sign in to view your dashboard.
          </div>
        )}

        {user?.role === "student" && <StudentDashboard />}
        {user && user.role !== "student" && <AdminDashboard />}
        {user && user.role !== "student" && <InstructorDashboard />}
      </PageShell>
    </AuthGuard>
  );
}
