import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";
import type { Enrollment } from "../domain/types";

type CreateEnrollmentInput = {
  userId: string;
  courseId: string;
};

type CreateEnrollmentResult = {
  enrollment: Enrollment;
  created: boolean;
};

const EnrollmentSchema = new Schema<Enrollment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const EnrollmentModel =
  (mongoose.models.Enrollment as mongoose.Model<Enrollment> | undefined) ??
  mongoose.model<Enrollment>("Enrollment", EnrollmentSchema);

export const findEnrollment = async (
  userId: string,
  courseId: string
): Promise<Enrollment | undefined> => {
  const enrollment = await EnrollmentModel.findOne({ userId, courseId })
    .select("-__v -_id")
    .lean<Enrollment>()
    .exec();
  return enrollment ?? undefined;
};

export const listEnrollmentsByUser = async (userId: string): Promise<Enrollment[]> =>
  EnrollmentModel.find({ userId })
    .sort({ createdAt: -1 })
    .select("-__v -_id")
    .lean<Enrollment[]>()
    .exec();

export const listEnrollmentsByCourse = async (courseId: string): Promise<Enrollment[]> =>
  EnrollmentModel.find({ courseId })
    .sort({ createdAt: -1 })
    .select("-__v -_id")
    .lean<Enrollment[]>()
    .exec();

export const createEnrollment = async (
  input: CreateEnrollmentInput
): Promise<CreateEnrollmentResult> => {
  const existing = await findEnrollment(input.userId, input.courseId);
  if (existing) {
    return { enrollment: existing, created: false };
  }

  const enrollment: Enrollment = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    createdAt: new Date(),
  };

  try {
    await EnrollmentModel.create(enrollment);
    return { enrollment, created: true };
  } catch (error) {
    const retry = await findEnrollment(input.userId, input.courseId);
    if (retry) {
      return { enrollment: retry, created: false };
    }
    throw error;
  }
};

export const isEnrolled = async (userId: string, courseId: string): Promise<boolean> =>
  (await findEnrollment(userId, courseId)) !== undefined;
