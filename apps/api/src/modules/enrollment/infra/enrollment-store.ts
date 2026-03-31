import { randomUUID } from "crypto";
import type { Enrollment } from "../domain/types";

const enrollments: Enrollment[] = [];

type CreateEnrollmentInput = {
  userId: string;
  courseId: string;
};

type CreateEnrollmentResult = {
  enrollment: Enrollment;
  created: boolean;
};

export const findEnrollment = (userId: string, courseId: string): Enrollment | undefined =>
  enrollments.find(
    (enrollment) => enrollment.userId === userId && enrollment.courseId === courseId
  );

export const listEnrollmentsByUser = (userId: string): Enrollment[] =>
  enrollments.filter((enrollment) => enrollment.userId === userId);

export const listEnrollmentsByCourse = (courseId: string): Enrollment[] =>
  enrollments.filter((enrollment) => enrollment.courseId === courseId);

export const createEnrollment = (input: CreateEnrollmentInput): CreateEnrollmentResult => {
  const existing = findEnrollment(input.userId, input.courseId);
  if (existing) {
    return { enrollment: existing, created: false };
  }

  const enrollment: Enrollment = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    createdAt: new Date(),
  };

  enrollments.push(enrollment);
  return { enrollment, created: true };
};

export const isEnrolled = (userId: string, courseId: string): boolean =>
  findEnrollment(userId, courseId) !== undefined;
