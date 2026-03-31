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
