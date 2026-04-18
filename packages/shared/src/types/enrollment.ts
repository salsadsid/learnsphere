export type EnrollmentId = string;

export type Enrollment = {
  id: EnrollmentId;
  userId: string;
  courseId: string;
  createdAt: Date;
};

export type EnrollmentResponseDto = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
};

export type EnrollmentStatusResponseDto = {
  enrolled: boolean;
  access: "owner" | "enrolled" | "none";
  enrollment?: EnrollmentResponseDto;
};

export type EnrollmentListResponseDto = {
  items: EnrollmentResponseDto[];
};

export type EnrollRequestDto = {
  courseId: string;
};
