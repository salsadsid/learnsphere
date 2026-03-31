import { AppError } from "../../../shared/errors";
import type { AuthUser } from "../../auth/domain/types";
import { findCourseById } from "../../courses/infra/course-store";
import { enqueueEnrollmentEmail } from "../../notifications/infra/notification-queue";
import type { Enrollment } from "../domain/types";
import { createEnrollment, findEnrollment, listEnrollmentsByUser } from "../infra/enrollment-store";
import type { EnrollmentListResponseDto, EnrollmentResponseDto, EnrollmentStatusResponseDto } from "./dto";

const toEnrollmentResponse = (enrollment: Enrollment): EnrollmentResponseDto => ({
  id: enrollment.id,
  userId: enrollment.userId,
  courseId: enrollment.courseId,
  createdAt: enrollment.createdAt.toISOString(),
});

export const assertCourseAccess = (courseId: string, user: AuthUser | undefined): void => {
  if (!user) {
    throw new AppError({
      status: 401,
      title: "Unauthorized",
      detail: "Missing user context.",
      type: "https://httpstatuses.com/401",
    });
  }

  const course = findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  if (user.role === "admin") {
    return;
  }

  if (user.role === "instructor" && course.instructorId === user.id) {
    return;
  }

  const enrollment = findEnrollment(user.id, courseId);
  if (!enrollment) {
    throw new AppError({
      status: 403,
      title: "Forbidden",
      detail: "You are not enrolled in this course.",
      type: "https://httpstatuses.com/403",
    });
  }
};

export const getEnrollmentStatusService = (
  courseId: string,
  user: AuthUser | undefined
): EnrollmentStatusResponseDto => {
  if (!user) {
    return { enrolled: false, access: "none" };
  }

  const course = findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  if (user.role === "admin" || (user.role === "instructor" && course.instructorId === user.id)) {
    return { enrolled: true, access: "owner" };
  }

  const enrollment = findEnrollment(user.id, courseId);
  if (!enrollment) {
    return { enrolled: false, access: "none" };
  }

  return {
    enrolled: true,
    access: "enrolled",
    enrollment: toEnrollmentResponse(enrollment),
  };
};

export const enrollUserService = (
  user: AuthUser,
  courseId: string
): { response: EnrollmentResponseDto; created: boolean } => {
  const course = findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const result = createEnrollment({ userId: user.id, courseId });
  if (result.created) {
    enqueueEnrollmentEmail({ userId: user.id, courseId });
  }
  return { response: toEnrollmentResponse(result.enrollment), created: result.created };
};

export const listEnrollmentsService = (user: AuthUser): EnrollmentListResponseDto => ({
  items: listEnrollmentsByUser(user.id).map(toEnrollmentResponse),
});
