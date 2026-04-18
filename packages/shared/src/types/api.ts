export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type AdminUserDto = {
  id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  isActive: boolean;
  createdAt: string;
  deactivatedAt?: string;
};

export type AdminUserListResponseDto = PaginatedResponse<AdminUserDto>;
