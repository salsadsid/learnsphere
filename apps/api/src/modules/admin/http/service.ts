import bcrypt from "bcryptjs";
import type { AuthUser } from "../../auth/domain/types";
import {
  listUsers,
  updateUserPassword,
  updateUserRole,
  updateUserStatus,
} from "../../auth/infra/user-store";
import { addAuditLogEntry } from "../../auth/infra/audit-log-store";
import type { AdminUserDto, AdminUserListResponseDto } from "./dto";
import type { ListUsersInput, ResetPasswordInput } from "./validation";

const toAdminUserDto = (user: AuthUser): AdminUserDto => ({
  id: user.id,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt.toISOString(),
  ...(user.deactivatedAt ? { deactivatedAt: user.deactivatedAt.toISOString() } : {}),
});

export const listUsersService = async (input: ListUsersInput): Promise<AdminUserListResponseDto> => {
  const { items, total } = await listUsers({
    page: input.page,
    pageSize: input.pageSize,
    ...(input.q ? { q: input.q } : {}),
    ...(input.role ? { role: input.role } : {}),
    ...(input.status ? { isActive: input.status === "active" } : {}),
  });

  const totalPages = Math.ceil(total / input.pageSize);
  const nextPage = input.page < totalPages ? input.page + 1 : null;

  return {
    items: items.map(toAdminUserDto),
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages,
    nextPage,
  };
};

export const updateUserRoleService = async (
  actor: AuthUser,
  userId: string,
  role: AuthUser["role"]
): Promise<AdminUserDto> => {
  const updated = await updateUserRole(userId, role);
  if (!updated) {
    throw new Error("User not found.");
  }

  await addAuditLogEntry({
    actorId: actor.id,
    actorRole: actor.role,
    action: "admin.user.role_updated",
    subject: updated.email,
  });

  return toAdminUserDto(updated);
};

export const updateUserStatusService = async (
  actor: AuthUser,
  userId: string,
  isActive: boolean
): Promise<AdminUserDto> => {
  const updated = await updateUserStatus(userId, isActive);
  if (!updated) {
    throw new Error("User not found.");
  }

  await addAuditLogEntry({
    actorId: actor.id,
    actorRole: actor.role,
    action: isActive ? "admin.user.reactivated" : "admin.user.deactivated",
    subject: updated.email,
  });

  return toAdminUserDto(updated);
};

export const resetUserPasswordService = async (
  actor: AuthUser,
  userId: string,
  input: ResetPasswordInput
): Promise<AdminUserDto> => {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const updated = await updateUserPassword(userId, passwordHash);
  if (!updated) {
    throw new Error("User not found.");
  }

  await addAuditLogEntry({
    actorId: actor.id,
    actorRole: actor.role,
    action: "admin.user.password_reset",
    subject: updated.email,
  });

  return toAdminUserDto(updated);
};
