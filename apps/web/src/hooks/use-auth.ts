"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authGetJson, postJson } from "@/shared/api";
import type { MeResponseDto, LoginResponseDto } from "@learnsphere/shared";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const result = await authGetJson<MeResponseDto>("/api/v1/auth/me");
      if (!result.ok || !result.data) return null;
      return result.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAuth() {
  const { data: user, isLoading } = useMe();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const result = await postJson<LoginResponseDto>("/api/v1/auth/login", body);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Login failed.");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const result = await postJson<{ id: string }>("/api/v1/auth/register", body);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Registration failed.");
      }
      return result.data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await postJson("/api/v1/auth/logout", {});
    },
    onSettled: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.invalidateQueries();
    },
  });
}
