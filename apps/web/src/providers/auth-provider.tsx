"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMe, useLogout } from "@/hooks/use-auth";
import type { MeResponseDto } from "@learnsphere/shared";

type AuthContextValue = {
  user: MeResponseDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: MeResponseDto["role"] | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    logout: () => logoutMutation.mutate(),
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  return useContext(AuthContext);
}
