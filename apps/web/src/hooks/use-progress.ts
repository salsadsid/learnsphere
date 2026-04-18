"use client";

import { useQuery } from "@tanstack/react-query";
import { authGetJson } from "@/shared/api";
import type {
  StudentDashboardResponseDto,
  InstructorCourseProgressResponseDto,
} from "@learnsphere/shared";

export const progressKeys = {
  studentDashboard: ["progress", "student", "dashboard"] as const,
  instructorCourse: (courseId: string) => ["progress", "instructor", "course", courseId] as const,
};

export function useStudentDashboard() {
  return useQuery({
    queryKey: progressKeys.studentDashboard,
    queryFn: async () => {
      const result = await authGetJson<StudentDashboardResponseDto>("/api/v1/progress/student/summary");
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load dashboard.");
      }
      return result.data;
    },
  });
}

export function useInstructorCourseProgress(courseId: string | null) {
  return useQuery({
    queryKey: progressKeys.instructorCourse(courseId ?? ""),
    queryFn: async () => {
      const result = await authGetJson<InstructorCourseProgressResponseDto>(
        `/api/v1/progress/instructor/course/${courseId}`
      );
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Failed to load progress.");
      }
      return result.data;
    },
    enabled: !!courseId,
  });
}
