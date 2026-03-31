import { randomUUID } from "crypto";
import { getQueueConnection } from "./queue-connection";

type EnrollmentEmailPayload = {
  userId: string;
  courseId: string;
};

type CourseUpdatePayload = {
  userId: string;
  courseId: string;
  courseTitle: string;
};

type NotificationJobType = "enrollment.email" | "course.update";

type NotificationPayload = EnrollmentEmailPayload | CourseUpdatePayload;

type NotificationJob = {
  id: string;
  type: NotificationJobType;
  payload: NotificationPayload;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "processed" | "failed" | "dead";
  lastError?: string;
};

type QueueMetrics = {
  queued: number;
  processed: number;
  failed: number;
  retried: number;
  deadLettered: number;
};

const pendingQueue: NotificationJob[] = [];
const deadLetterQueue: NotificationJob[] = [];
const metrics: QueueMetrics = {
  queued: 0,
  processed: 0,
  failed: 0,
  retried: 0,
  deadLettered: 0,
};

const enqueueJob = (
  job: Omit<NotificationJob, "id" | "createdAt" | "attempts" | "status" | "lastError" | "maxAttempts"> & {
    maxAttempts?: number;
  }
): NotificationJob => {
  getQueueConnection();
  const record: NotificationJob = {
    id: randomUUID(),
    createdAt: new Date(),
    attempts: 0,
    status: "pending",
    ...job,
    maxAttempts: job.maxAttempts ?? 3,
  };

  pendingQueue.push(record);
  metrics.queued += 1;
  console.log("Notification job queued.", record);
  return record;
};

const defaultHandler = async (job: NotificationJob): Promise<void> => {
  switch (job.type) {
    case "enrollment.email":
      console.log("Processing enrollment email.", job.payload);
      return;
    case "course.update":
      console.log("Processing course update email.", job.payload);
      return;
    default:
      throw new Error(`Unsupported job type: ${job.type}`);
  }
};

export const processNotificationQueue = async (
  handler: (job: NotificationJob) => Promise<void> = defaultHandler
): Promise<void> => {
  while (pendingQueue.length > 0) {
    const job = pendingQueue.shift();
    if (!job) {
      return;
    }

    job.status = "processing";

    try {
      await handler(job);
      job.status = "processed";
      metrics.processed += 1;
      console.log("Notification job processed.", job);
    } catch (error) {
      job.attempts += 1;
      job.status = "failed";
      job.lastError = error instanceof Error ? error.message : "Unknown error";
      metrics.failed += 1;

      if (job.attempts >= job.maxAttempts) {
        job.status = "dead";
        deadLetterQueue.push(job);
        metrics.deadLettered += 1;
        console.warn("Notification job moved to dead-letter queue.", job);
      } else {
        pendingQueue.push(job);
        metrics.retried += 1;
        console.warn("Notification job retry scheduled.", job);
      }
    }
  }
};

export const getNotificationQueueMetrics = (): QueueMetrics & {
  pending: number;
  deadLetter: number;
} => ({
  ...metrics,
  pending: pendingQueue.length,
  deadLetter: deadLetterQueue.length,
});

export const enqueueEnrollmentEmail = (payload: EnrollmentEmailPayload): NotificationJob =>
  enqueueJob({ type: "enrollment.email", payload });

export const enqueueCourseUpdateEmail = (payload: CourseUpdatePayload): NotificationJob =>
  enqueueJob({ type: "course.update", payload });
