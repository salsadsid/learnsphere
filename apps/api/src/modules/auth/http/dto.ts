import type { UserRole } from "../domain/types";

export type RegisterRequestDto = {
  email: string;
  password: string;
};

export type RegisterResponseDto = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken: string;
  expiresInSeconds: number;
  refreshToken: string;
};

export type RefreshResponseDto = {
  accessToken: string;
  expiresInSeconds: number;
  refreshToken: string;
};
