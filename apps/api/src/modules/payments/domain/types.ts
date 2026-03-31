export type PaymentId = string;

export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentRecord = {
  id: PaymentId;
  userId: string;
  courseId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  provider: "mock";
  providerSessionId: string;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
};

export type WebhookEventRecord = {
  id: string;
  eventId: string;
  type: "payment.succeeded" | "payment.failed";
  receivedAt: Date;
};
