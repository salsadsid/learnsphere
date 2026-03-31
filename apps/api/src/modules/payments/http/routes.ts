import type { Request } from "express";
import { Router } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import type { AuthUser } from "../../auth/domain/types";
import {
  createCheckoutService,
  getPaymentStatusService,
  handleWebhookService,
  listPaymentHistoryService,
  verifyWebhookSignature,
} from "./service";
import { validateCheckoutInput, validateCourseParamInput, validateWebhookInput } from "./validation";
import type {
  CreateCheckoutResponseDto,
  PaymentHistoryResponseDto,
  PaymentStatusResponseDto,
  PaymentWebhookResponseDto,
} from "./dto";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const paymentsRouter = Router();

paymentsRouter.get("/history", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const response: PaymentHistoryResponseDto = await listPaymentHistoryService(req.user);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

paymentsRouter.get(
  "/status/:courseId",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateCourseParamInput(req.params);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid course id.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const response: PaymentStatusResponseDto = await getPaymentStatusService(
      req.user,
      validation.data.courseId
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post("/checkout", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = validateCheckoutInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid checkout payload.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const idempotencyKey = String(req.header("x-idempotency-key") ?? "").trim();
    if (!idempotencyKey) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Missing idempotency key.",
        type: "https://httpstatuses.com/400",
      });
    }

    const response: CreateCheckoutResponseDto = await createCheckoutService(
      req.user,
      validation.data,
      idempotencyKey
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post("/webhook", async (req, res, next) => {
  try {
    const signature = req.header("x-signature") ?? undefined;
    verifyWebhookSignature(req.body, signature);

    const validation = validateWebhookInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid webhook payload.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const response: PaymentWebhookResponseDto = await handleWebhookService(validation.data);
    res.json(response);
  } catch (error) {
    next(error);
  }
});
