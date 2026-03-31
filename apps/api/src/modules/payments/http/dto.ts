export type CreateCheckoutRequestDto = {
  courseId: string;
};

export type CreateCheckoutResponseDto = {
  paymentId: string;
  sessionId: string;
  checkoutUrl: string;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
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
  status?: "pending" | "paid" | "failed";
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
  status: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export type PaymentHistoryResponseDto = {
  items: PaymentHistoryItemDto[];
};
