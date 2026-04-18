export type UserId = string;

export type UserRole = "student" | "instructor" | "admin";

export type AuthUser = {
  id: UserId;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  deactivatedAt?: Date;
  createdAt: Date;
};

export type AuditLogEntry = {
  id: string;
  actorId: UserId | "system";
  actorRole?: UserRole;
  action: string;
  subject: string;
  createdAt: Date;
};

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

export type MeResponseDto = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type ProfileResponseDto = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};
