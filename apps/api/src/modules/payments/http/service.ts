import crypto from "crypto";
import { config } from "../../../shared/config";
import { AppError } from "../../../shared/errors";
import { findCourseById } from "../../courses/infra/course-store";
import type { AuthUser } from "../../auth/domain/types";
import { createEnrollment } from "../../enrollment/infra/enrollment-store";
import { enqueueEnrollmentEmail } from "../../notifications/infra/notification-queue";
import {
  createCheckoutSession,
  findPaymentBySessionId,
  findPaidPaymentByUserCourse,
  findPendingPaymentByUserCourse,
  getPaymentSummaryByUserCourse,
  listPaymentsByUser,
  recordWebhookEvent,
  updatePaymentStatus,
} from "../infra/payment-store";
import type {
  CreateCheckoutResponseDto,
  PaymentHistoryResponseDto,
  PaymentHistoryItemDto,
  PaymentStatusResponseDto,
  PaymentWebhookResponseDto,
} from "./dto";
import type { CheckoutInput, WebhookInput } from "./validation";

const MOCK_AMOUNT_CENTS = 9900;
const MOCK_CURRENCY = "usd";

export const createCheckoutService = (
  user: AuthUser,
  input: CheckoutInput,
  idempotencyKey: string
): CreateCheckoutResponseDto => {
  const course = findCourseById(input.courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const paidPayment = findPaidPaymentByUserCourse(user.id, input.courseId);
  if (paidPayment) {
    return {
      paymentId: paidPayment.id,
      sessionId: paidPayment.providerSessionId,
      checkoutUrl: `${config.webOrigin}/courses/${input.courseId}`,
      amountCents: paidPayment.amountCents,
      currency: paidPayment.currency,
      status: paidPayment.status,
    };
  }

  const pendingPayment = findPendingPaymentByUserCourse(user.id, input.courseId);
  if (pendingPayment) {
    return {
      paymentId: pendingPayment.id,
      sessionId: pendingPayment.providerSessionId,
      checkoutUrl: `${config.webOrigin}/checkout/${pendingPayment.providerSessionId}`,
      amountCents: pendingPayment.amountCents,
      currency: pendingPayment.currency,
      status: pendingPayment.status,
    };
  }

  const result = createCheckoutSession({
    userId: user.id,
    courseId: input.courseId,
    amountCents: MOCK_AMOUNT_CENTS,
    currency: MOCK_CURRENCY,
    idempotencyKey,
  });

  return {
    paymentId: result.payment.id,
    sessionId: result.payment.providerSessionId,
    checkoutUrl: `${config.webOrigin}/checkout/${result.payment.providerSessionId}`,
    amountCents: result.payment.amountCents,
    currency: result.payment.currency,
    status: result.payment.status,
  };
};

export const getPaymentStatusService = (
  user: AuthUser,
  courseId: string
): PaymentStatusResponseDto => {
  const course = findCourseById(courseId);
  if (!course) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Course not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  const summary = getPaymentSummaryByUserCourse(user.id, courseId);
  if (!summary) {
    return { courseId, hasPayment: false };
  }

  return {
    courseId,
    hasPayment: true,
    paymentId: summary.payment.id,
    status: summary.status,
    amountCents: summary.payment.amountCents,
    currency: summary.payment.currency,
    updatedAt: summary.payment.updatedAt.toISOString(),
  };
};

const toPaymentHistoryItem = (payment: ReturnType<typeof listPaymentsByUser>[number]): PaymentHistoryItemDto => {
  const course = findCourseById(payment.courseId);

  return {
    paymentId: payment.id,
    courseId: payment.courseId,
    ...(course?.title ? { courseTitle: course.title } : {}),
    amountCents: payment.amountCents,
    currency: payment.currency,
    status: payment.status,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    ...(payment.paidAt ? { paidAt: payment.paidAt.toISOString() } : {}),
  };
};

export const listPaymentHistoryService = (user: AuthUser): PaymentHistoryResponseDto => ({
  items: listPaymentsByUser(user.id).map(toPaymentHistoryItem),
});

export const verifyWebhookSignature = (payload: unknown, signature: string | undefined): void => {
  if (!config.paymentWebhookSecret) {
    throw new AppError({
      status: 500,
      title: "Configuration Error",
      detail: "Payment webhook secret is not configured.",
      type: "https://httpstatuses.com/500",
    });
  }

  if (!signature) {
    throw new AppError({
      status: 400,
      title: "Validation Error",
      detail: "Missing webhook signature.",
      type: "https://httpstatuses.com/400",
    });
  }

  const raw = JSON.stringify(payload);
  const digest = crypto
    .createHmac("sha256", config.paymentWebhookSecret)
    .update(raw)
    .digest("hex");

  if (digest !== signature) {
    throw new AppError({
      status: 401,
      title: "Unauthorized",
      detail: "Invalid webhook signature.",
      type: "https://httpstatuses.com/401",
    });
  }
};

export const handleWebhookService = (input: WebhookInput): PaymentWebhookResponseDto => {
  const shouldProcess = recordWebhookEvent(input.eventId, input.type);
  if (!shouldProcess) {
    return { processed: false };
  }

  const payment = findPaymentBySessionId(input.sessionId);
  if (!payment) {
    throw new AppError({
      status: 404,
      title: "Not Found",
      detail: "Payment session not found.",
      type: "https://httpstatuses.com/404",
    });
  }

  if (payment.status === "paid") {
    return { processed: true, paymentId: payment.id, status: "paid" };
  }

  if (input.type === "payment.succeeded") {
    updatePaymentStatus(payment, "paid");
    const enrollment = createEnrollment({ userId: input.userId, courseId: input.courseId });
    if (enrollment.created) {
      enqueueEnrollmentEmail({ userId: input.userId, courseId: input.courseId });
    }
    return { processed: true, paymentId: payment.id, status: "paid" };
  }

  updatePaymentStatus(payment, "failed");
  return { processed: true, paymentId: payment.id, status: "failed" };
};
