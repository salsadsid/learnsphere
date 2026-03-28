export type UserId = string;

export type UserRole = "student" | "instructor" | "admin";

export type AuthUser = {
  id: UserId;
  email: string;
  passwordHash: string;
  role: UserRole;
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
