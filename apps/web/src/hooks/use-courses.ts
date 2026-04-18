"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authGetJson, authPostJson, authPatchJson, getJson } from "@/shared/api";
import type {
  CourseResponseDto,
  CourseDetailResponseDto,
  ListCoursesResponseDto,
  CourseCategoriesResponseDto,
  InstructorSummaryResponseDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto,
} from "@learnsphere/shared";

export const courseKeys = {
  all: ["courses"] as const,
  list: (filters: Record<string, string>) => ["courses", "list", filters] as const,
  detail: (id: string) => ["courses", "detail", id] as const,
  categories: (status?: string) => ["courses", "categories", status] as const,
  instructorSummary: ["courses", "instructor", "summary"] as const,
  instructorCourses: ["courses", "instructor", "courses"] as const,
};

export function useCourses(filters: {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
}) {
  const params: Record<string, string> = {};
  if (filters.q) params.q = filters.q;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.category && filters.category !== "all") params.category = filters.category;
  if (filters.page) params.page = String(filters.page);

  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams(params).toString();
      const path = qs ? `/api/v1/courses?${qs}` : "/api/v1/courses";
      const result = await getJson<ListCoursesResponseDto>(path);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load courses.");
      }
      return result.data;
    },
  });
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async () => {
      const result = await getJson<CourseDetailResponseDto>(`/api/v1/courses/${courseId}`);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load course.");
      }
      return result.data;
    },
    enabled: !!courseId,
  });
}

export function useCategories(status?: string) {
  return useQuery({
    queryKey: courseKeys.categories(status),
    queryFn: async () => {
      const qs = status && status !== "all" ? `?status=${status}` : "";
      const result = await getJson<CourseCategoriesResponseDto>(`/api/v1/courses/categories${qs}`);
      if (!result.ok || !result.data) return { categories: [] as string[] };
      return result.data;
    },
  });
}

export function useInstructorSummary() {
  return useQuery({
    queryKey: courseKeys.instructorSummary,
    queryFn: async () => {
      const result = await authGetJson<InstructorSummaryResponseDto>("/api/v1/courses/instructor/summary");
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load summary.");
      }
      return result.data;
    },
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: courseKeys.instructorCourses,
    queryFn: async () => {
      const result = await authGetJson<ListCoursesResponseDto>("/api/v1/courses/instructor/courses");
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load courses.");
      }
      return result.data;
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateCourseRequestDto) => {
      const result = await authPostJson<CourseResponseDto>("/api/v1/courses", body);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to create course.");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateCourseRequestDto) => {
      const result = await authPatchJson<CourseResponseDto>(`/api/v1/courses/${courseId}`, body);
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to update course.");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
