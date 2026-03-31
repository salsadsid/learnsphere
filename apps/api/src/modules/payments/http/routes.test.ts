import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { registerUser } from "../../auth/use-cases/register-user";

let app: typeof import("../../../app").app;

type AuthContext = {
  accessToken: string;
  userId: string;
};

const createUserAndLogin = async (role: "student" | "instructor") => {
  const email = `${role}-${Date.now()}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  const user = registerUser({ email, passwordHash, role });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return {
    accessToken: loginResponse.body.accessToken as string,
    userId: user.id,
  };
};

beforeAll(async () => {
  process.env.PAYMENT_WEBHOOK_SECRET = "test-secret";
  vi.resetModules();
  const mod = await import("../../../app");
  app = mod.app;
});

describe("payment routes", () => {
  it("creates checkout, reports status, and handles webhook idempotency", async () => {
    const instructor = await createUserAndLogin("instructor");
    const student = await createUserAndLogin("student");

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Payment 101", summary: "Learn the flow." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const idempotencyKey = "checkout-key-1";
    const checkoutResponse = await request(app)
      .post("/api/v1/payments/checkout")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .set("x-idempotency-key", idempotencyKey)
      .send({ courseId });

    expect(checkoutResponse.status).toBe(201);
    expect(checkoutResponse.body.status).toBe("pending");

    const secondCheckout = await request(app)
      .post("/api/v1/payments/checkout")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .set("x-idempotency-key", idempotencyKey)
      .send({ courseId });

    expect(secondCheckout.status).toBe(201);
    expect(secondCheckout.body.paymentId).toBe(checkoutResponse.body.paymentId);

    const statusResponse = await request(app)
      .get(`/api/v1/payments/status/${courseId}`)
      .set("Authorization", `Bearer ${student.accessToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.hasPayment).toBe(true);
    expect(statusResponse.body.status).toBe("pending");

    const webhookPayload = {
      eventId: `evt_${Date.now()}`,
      type: "payment.succeeded",
      sessionId: checkoutResponse.body.sessionId as string,
      courseId,
      userId: student.userId,
    };

    const signature = crypto
      .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET as string)
      .update(JSON.stringify(webhookPayload))
      .digest("hex");

    const webhookResponse = await request(app)
      .post("/api/v1/payments/webhook")
      .set("x-signature", signature)
      .send(webhookPayload);

    expect(webhookResponse.status).toBe(200);
    expect(webhookResponse.body.status).toBe("paid");

    const duplicateWebhook = await request(app)
      .post("/api/v1/payments/webhook")
      .set("x-signature", signature)
      .send(webhookPayload);

    expect(duplicateWebhook.status).toBe(200);
    expect(duplicateWebhook.body.processed).toBe(false);

    const statusAfter = await request(app)
      .get(`/api/v1/payments/status/${courseId}`)
      .set("Authorization", `Bearer ${student.accessToken}`);

    expect(statusAfter.status).toBe(200);
    expect(statusAfter.body.status).toBe("paid");
  });

  it("allows retry after failed payment", async () => {
    const instructor = await createUserAndLogin("instructor");
    const student = await createUserAndLogin("student");

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Retry Path", summary: "Test retry flow." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const firstCheckout = await request(app)
      .post("/api/v1/payments/checkout")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .set("x-idempotency-key", "checkout-key-fail")
      .send({ courseId });

    expect(firstCheckout.status).toBe(201);

    const failedPayload = {
      eventId: `evt_fail_${Date.now()}`,
      type: "payment.failed",
      sessionId: firstCheckout.body.sessionId as string,
      courseId,
      userId: student.userId,
    };

    const signature = crypto
      .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET as string)
      .update(JSON.stringify(failedPayload))
      .digest("hex");

    const failedWebhook = await request(app)
      .post("/api/v1/payments/webhook")
      .set("x-signature", signature)
      .send(failedPayload);

    expect(failedWebhook.status).toBe(200);
    expect(failedWebhook.body.status).toBe("failed");

    const retryCheckout = await request(app)
      .post("/api/v1/payments/checkout")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .set("x-idempotency-key", "checkout-key-retry")
      .send({ courseId });

    expect(retryCheckout.status).toBe(201);
    expect(retryCheckout.body.status).toBe("pending");
  });
});
