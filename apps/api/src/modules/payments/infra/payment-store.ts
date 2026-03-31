import { randomUUID } from "crypto";
import type { PaymentRecord, PaymentStatus, WebhookEventRecord } from "../domain/types";

const payments: PaymentRecord[] = [];
const idempotencyIndex = new Map<string, string>();
const processedWebhookEvents = new Map<string, WebhookEventRecord>();

type CreateCheckoutInput = {
  userId: string;
  courseId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
};

type CreateCheckoutResult = {
  payment: PaymentRecord;
  created: boolean;
};

type PaymentSummary = {
  payment: PaymentRecord;
  status: PaymentStatus;
};

export const createCheckoutSession = (input: CreateCheckoutInput): CreateCheckoutResult => {
  const key = `${input.userId}:${input.courseId}:${input.idempotencyKey}`;
  const existingId = idempotencyIndex.get(key);
  if (existingId) {
    const existing = payments.find((payment) => payment.id === existingId);
    if (existing) {
      return { payment: existing, created: false };
    }
  }

  const now = new Date();
  const payment: PaymentRecord = {
    id: randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    amountCents: input.amountCents,
    currency: input.currency,
    status: "pending",
    provider: "mock",
    providerSessionId: `session_${randomUUID()}`,
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
    updatedAt: now,
  };

  payments.push(payment);
  idempotencyIndex.set(key, payment.id);
  return { payment, created: true };
};

export const findPaymentBySessionId = (sessionId: string): PaymentRecord | undefined =>
  payments.find((payment) => payment.providerSessionId === sessionId);

export const listPaymentsByUser = (userId: string): PaymentRecord[] =>
  payments
    .filter((payment) => payment.userId === userId)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

export const findLatestPaymentByUserCourse = (
  userId: string,
  courseId: string
): PaymentRecord | undefined =>
  payments
    .filter((payment) => payment.userId === userId && payment.courseId === courseId)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

export const findPaidPaymentByUserCourse = (
  userId: string,
  courseId: string
): PaymentRecord | undefined =>
  payments.find(
    (payment) => payment.userId === userId && payment.courseId === courseId && payment.status === "paid"
  );

export const findPendingPaymentByUserCourse = (
  userId: string,
  courseId: string
): PaymentRecord | undefined =>
  payments.find(
    (payment) => payment.userId === userId && payment.courseId === courseId && payment.status === "pending"
  );

export const getPaymentSummaryByUserCourse = (
  userId: string,
  courseId: string
): PaymentSummary | null => {
  const payment = findLatestPaymentByUserCourse(userId, courseId);
  if (!payment) {
    return null;
  }
  return { payment, status: payment.status };
};

export const updatePaymentStatus = (
  payment: PaymentRecord,
  status: PaymentStatus
): PaymentRecord => {
  payment.status = status;
  payment.updatedAt = new Date();
  if (status === "paid") {
    payment.paidAt = new Date();
  }
  return payment;
};

export const recordWebhookEvent = (eventId: string, type: WebhookEventRecord["type"]): boolean => {
  if (processedWebhookEvents.has(eventId)) {
    return false;
  }

  processedWebhookEvents.set(eventId, {
    id: randomUUID(),
    eventId,
    type,
    receivedAt: new Date(),
  });

  return true;
};
