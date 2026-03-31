export type EnrollmentId = string;

export type Enrollment = {
  id: EnrollmentId;
  userId: string;
  courseId: string;
  createdAt: Date;
};
