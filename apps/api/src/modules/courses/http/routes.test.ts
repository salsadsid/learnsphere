import request from "supertest";
import { describe, expect, it } from "vitest";
import * as bcrypt from "bcryptjs";
import { app } from "../../../app";
import { registerUser } from "../../auth/use-cases/register-user";

type AuthContext = {
  accessToken: string;
  email: string;
  password: string;
};

const createAdminAndLogin = async (): Promise<AuthContext> => {
  const email = `admin-${Date.now()}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  registerUser({ email, passwordHash, role: "admin" });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return {
    accessToken: loginResponse.body.accessToken as string,
    email,
    password,
  };
};

describe("course routes", () => {
  it("supports basic course lifecycle", async () => {
    const auth = await createAdminAndLogin();

    const createResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({
        title: "Intro to Product Strategy",
        summary: "Build a repeatable strategy framework.",
        category: "Strategy",
        level: "beginner",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.status).toBe("draft");

    const courseId = createResponse.body.id as string;

    const publishFail = await request(app)
      .post(`/api/v1/courses/${courseId}/publish`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send();

    expect(publishFail.status).toBe(400);

    const moduleResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ title: "Foundations", summary: "Core concepts" });

    expect(moduleResponse.status).toBe(201);

    const moduleId = moduleResponse.body.id as string;

    const lessonResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ title: "Strategy basics", durationMinutes: 15 });

    expect(lessonResponse.status).toBe(201);

    const detailResponse = await request(app).get(`/api/v1/courses/${courseId}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.modules.length).toBe(1);
    expect(detailResponse.body.modules[0].lessons.length).toBe(1);

    const publishResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/publish`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send();

    expect(publishResponse.status).toBe(200);
    expect(publishResponse.body.status).toBe("published");

    const updateResponse = await request(app)
      .patch(`/api/v1/courses/${courseId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ title: "Intro to Product Strategy (Updated)" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toContain("Updated");

    const listResponse = await request(app)
      .get("/api/v1/courses")
      .query({ q: "strategy", status: "published" });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items.length).toBeGreaterThan(0);

    const unpublishResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/unpublish`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send();

    expect(unpublishResponse.status).toBe(200);
    expect(unpublishResponse.body.status).toBe("draft");
  });
});
