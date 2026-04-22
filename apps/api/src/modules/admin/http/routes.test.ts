import request from "supertest";
import { describe, expect, it } from "vitest";
import * as bcrypt from "bcryptjs";
import { app } from "../../../app";
import { registerUser } from "../../auth/use-cases/register-user";

type AuthContext = {
  accessToken: string;
  userId: string;
};

const createUserAndLogin = async (
  role: "student" | "instructor" | "admin"
): Promise<AuthContext> => {
  const email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await registerUser({ email, passwordHash, role });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return {
    accessToken: loginResponse.body.accessToken as string,
    userId: user.id,
  };
};

describe("admin routes", () => {
  it("lists users with pagination", async () => {
    const admin = await createUserAndLogin("admin");

    const listResponse = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .query({ page: 1, pageSize: 10 });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toBeDefined();
    expect(listResponse.body.total).toBeGreaterThan(0);
  });

  it("updates a user role from student to instructor", async () => {
    const admin = await createUserAndLogin("admin");
    const student = await createUserAndLogin("student");

    const updateResponse = await request(app)
      .patch(`/api/v1/admin/users/${student.userId}/role`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ role: "instructor" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.role).toBe("instructor");
  });

  it("deactivates and reactivates a user", async () => {
    const admin = await createUserAndLogin("admin");
    const student = await createUserAndLogin("student");

    const deactivateResponse = await request(app)
      .patch(`/api/v1/admin/users/${student.userId}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "inactive" });

    expect(deactivateResponse.status).toBe(200);
    expect(deactivateResponse.body.isActive).toBe(false);

    const reactivateResponse = await request(app)
      .patch(`/api/v1/admin/users/${student.userId}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "active" });

    expect(reactivateResponse.status).toBe(200);
    expect(reactivateResponse.body.isActive).toBe(true);
  });

  it("resets a user password", async () => {
    const admin = await createUserAndLogin("admin");
    const student = await createUserAndLogin("student");

    const resetResponse = await request(app)
      .post(`/api/v1/admin/users/${student.userId}/password`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ password: "newPassword123" });

    expect(resetResponse.status).toBe(200);

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: resetResponse.body.email as string,
        password: "newPassword123",
      });

    expect(loginResponse.status).toBe(200);
  });

  it("rejects non-admin access with 403", async () => {
    const student = await createUserAndLogin("student");

    const listResponse = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .query({ page: 1, pageSize: 10 });

    expect(listResponse.status).toBe(403);
  });

  it("prevents admin from changing their own role", async () => {
    const admin = await createUserAndLogin("admin");

    const selfUpdate = await request(app)
      .patch(`/api/v1/admin/users/${admin.userId}/role`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ role: "student" });

    expect(selfUpdate.status).toBe(400);
  });
});
