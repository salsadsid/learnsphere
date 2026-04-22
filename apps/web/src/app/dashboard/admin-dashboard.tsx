"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdminUsers, useUpdateRole, useUpdateUserStatus, useResetPassword } from "@/hooks/use-admin";
import { GlassCard, SectionHeading } from "@/shared/ui";
import type { AdminUserDto } from "@learnsphere/shared";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "instructor" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeRole, setActiveRole] = useState<"all" | "student" | "instructor" | "admin">("all");
  const [activeStatus, setActiveStatus] = useState<"all" | "active" | "inactive">("active");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUserDto["role"]>>({});

  const { data, isLoading, error } = useAdminUsers({
    q: activeQuery || undefined,
    role: activeRole !== "all" ? activeRole : undefined,
    status: activeStatus !== "all" ? activeStatus : undefined,
    page,
  });

  const updateRole = useUpdateRole();
  const updateStatus = useUpdateUserStatus();
  const resetPassword = useResetPassword();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveQuery(query);
    setActiveRole(roleFilter);
    setActiveStatus(statusFilter);
    setPage(1);
  };

  const handleReset = () => {
    setQuery("");
    setRoleFilter("all");
    setStatusFilter("active");
    setActiveQuery("");
    setActiveRole("all");
    setActiveStatus("active");
    setPage(1);
  };

  const handleRoleUpdate = async (userId: string, role: AdminUserDto["role"]) => {
    setBusyUserId(userId);
    setMessage(null);
    try {
      await updateRole.mutateAsync({ userId, role });
      setMessage("Role updated successfully.");
    } catch {
      setMessage("Unable to update role.");
    }
    setBusyUserId(null);
  };

  const handleStatusUpdate = async (userId: string, nextStatus: "active" | "inactive") => {
    setBusyUserId(userId);
    setMessage(null);
    try {
      await updateStatus.mutateAsync({ userId, status: nextStatus });
      setMessage(nextStatus === "active" ? "User reactivated." : "User deactivated.");
    } catch {
      setMessage("Unable to update status.");
    }
    setBusyUserId(null);
  };

  const handlePasswordReset = async (userId: string) => {
    const pw = (passwordDrafts[userId] ?? "").trim();
    if (pw.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setBusyUserId(userId);
    setMessage(null);
    try {
      await resetPassword.mutateAsync({ userId, password: pw });
      setPasswordDrafts((prev) => ({ ...prev, [userId]: "" }));
      setMessage("Password reset successfully.");
    } catch {
      setMessage("Unable to reset password.");
    }
    setBusyUserId(null);
  };

  return (
    <>
      <SectionHeading
        eyebrow="Admin control"
        title="User management"
        description="Manage roles, access, and passwords across the platform."
      />
      <GlassCard className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-5">
            <form onSubmit={handleSearchSubmit} className="grid gap-3">
              <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
                Search email
                <input
                  className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                  placeholder="Search by email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
                  Role
                  <select
                    className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(e.target.value as "all" | "student" | "instructor" | "admin")
                    }
                  >
                    <option value="all">All roles</option>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
                  Status
                  <select
                    className="h-11 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as "all" | "active" | "inactive")
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="all">All</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-11 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-5 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin guide</p>
            <p className="mt-2">
              Role changes and deactivations take effect immediately. Use strong passwords when
              resetting access for instructors.
            </p>
            {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
          </div>
        </div>

        {isLoading && <p className="text-sm text-slate-600">Loading users...</p>}

        {error && <p className="text-sm text-rose-600">{error.message}</p>}

        {data && (
          <div className="grid gap-4">
            {data.items.length === 0 ? (
              <p className="text-sm text-slate-600">No users found.</p>
            ) : (
              data.items.map((u) => {
                const roleValue = roleDrafts[u.id] ?? u.role;
                const passwordValue = passwordDrafts[u.id] ?? "";
                const isBusy = busyUserId === u.id;
                const isSelf = user?.id === u.id;

                return (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-4 text-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {u.email}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Created {new Date(u.createdAt).toLocaleDateString()}
                          {u.deactivatedAt
                            ? ` • Deactivated ${new Date(u.deactivatedAt).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                          u.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {u.isActive ? "active" : "inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_1.1fr_1.3fr]">
                      <div className="grid gap-2">
                        <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Role
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="h-10 flex-1 rounded-full border border-slate-900/10 bg-white px-4 text-sm"
                            value={roleValue}
                            onChange={(e) =>
                              setRoleDrafts((prev) => ({
                                ...prev,
                                [u.id]: e.target.value as AdminUserDto["role"],
                              }))
                            }
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="button"
                            disabled={isBusy || isSelf || roleValue === u.role}
                            onClick={() => handleRoleUpdate(u.id, roleValue)}
                            className="h-10 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                          >
                            Update
                          </button>
                        </div>
                        {isSelf && (
                          <p className="text-[11px] text-slate-500">
                            You cannot change your own role.
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Access
                        </label>
                        <button
                          type="button"
                          disabled={isBusy || isSelf}
                          onClick={() =>
                            handleStatusUpdate(u.id, u.isActive ? "inactive" : "active")
                          }
                          className="h-10 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                        >
                          {u.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                        {isSelf && (
                          <p className="text-[11px] text-slate-500">
                            You cannot change your own status.
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Reset password
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            className="h-10 flex-1 rounded-full border border-slate-900/10 bg-white px-4 text-sm"
                            placeholder="New password"
                            value={passwordValue}
                            onChange={(e) =>
                              setPasswordDrafts((prev) => ({
                                ...prev,
                                [u.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            disabled={isBusy || passwordValue.trim().length < 8}
                            onClick={() => handlePasswordReset(u.id)}
                            className="h-10 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {data.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                  Page {data.page} of {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={data.page <= 1}
                    className="h-9 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => (data.nextPage ? prev + 1 : prev))}
                    disabled={!data.nextPage}
                    className="h-9 rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-900/30 disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </>
  );
}
