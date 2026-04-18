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

export type CreateCheckoutRequestDto = {
  courseId: string;
};

export type CreateCheckoutResponseDto = {
  paymentId: string;
  sessionId: string;
  checkoutUrl: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
};

export type PaymentWebhookRequestDto = {
  eventId: string;
  type: "payment.succeeded" | "payment.failed";
  sessionId: string;
  courseId: string;
  userId: string;
};

export type PaymentWebhookResponseDto = {
  processed: boolean;
  paymentId?: string;
  status?: "paid" | "failed";
};

export type PaymentStatusResponseDto = {
  courseId: string;
  hasPayment: boolean;
  paymentId?: string;
  status?: PaymentStatus;
  amountCents?: number;
  currency?: string;
  updatedAt?: string;
};

export type PaymentHistoryItemDto = {
  paymentId: string;
  courseId: string;
  courseTitle?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export type PaymentHistoryResponseDto = {
  items: PaymentHistoryItemDto[];
};
