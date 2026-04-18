"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authGetJson, authPatchJson, authPostJson } from "@/shared/api";
import type { AdminUserListResponseDto, AdminUserDto } from "@learnsphere/shared";

export const adminKeys = {
  all: ["admin"] as const,
  users: (filters: Record<string, string>) => ["admin", "users", filters] as const,
};

export function useAdminUsers(filters: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
}) {
  const params: Record<string, string> = {};
  params.page = String(filters.page ?? 1);
  params.pageSize = "20";
  if (filters.q) params.q = filters.q;
  if (filters.role && filters.role !== "all") params.role = filters.role;
  if (filters.status && filters.status !== "all") params.status = filters.status;

  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async () => {
      const qs = new URLSearchParams(params).toString();
      const result = await authGetJson<AdminUserListResponseDto>(`/api/v1/admin/users?${qs}`);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load users.");
      }
      return result.data;
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AdminUserDto["role"] }) => {
      const result = await authPatchJson<AdminUserDto>(`/api/v1/admin/users/${userId}/role`, { role });
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to update role.");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "active" | "inactive" }) => {
      const result = await authPatchJson<AdminUserDto>(`/api/v1/admin/users/${userId}/status`, { status });
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to update status.");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const result = await authPostJson<AdminUserDto>(`/api/v1/admin/users/${userId}/password`, { password });
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to reset password.");
      }
      return result.data;
    },
  });
}
