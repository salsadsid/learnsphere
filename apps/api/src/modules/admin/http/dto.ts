import type { UserRole } from "../../auth/domain/types";

export type AdminUserDto = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  deactivatedAt?: string;
};

export type AdminUserListResponseDto = {
  items: AdminUserDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
};
