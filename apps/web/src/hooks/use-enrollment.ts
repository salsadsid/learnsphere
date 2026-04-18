"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authGetJson, authPostJson } from "@/shared/api";
import type {
  EnrollmentListResponseDto,
  EnrollmentStatusResponseDto,
} from "@learnsphere/shared";
import { courseKeys } from "./use-courses";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  list: ["enrollments", "list"] as const,
  status: (courseId: string) => ["enrollments", "status", courseId] as const,
};

export function useEnrollments() {
  return useQuery({
    queryKey: enrollmentKeys.list,
    queryFn: async () => {
      const result = await authGetJson<EnrollmentListResponseDto>("/api/v1/enrollments");
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load enrollments.");
      }
      return result.data;
    },
  });
}

export function useEnrollmentStatus(courseId: string) {
  return useQuery({
    queryKey: enrollmentKeys.status(courseId),
    queryFn: async () => {
      const result = await authGetJson<EnrollmentStatusResponseDto>(
        `/api/v1/enrollments/status/${courseId}`
      );
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to check enrollment.");
      }
      return result.data;
    },
    enabled: !!courseId,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const result = await authPostJson<{ id: string }>("/api/v1/enrollments", { courseId });
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to enroll.");
      }
      return result.data;
    },
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.status(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}
