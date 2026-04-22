import request from "supertest";
import { describe, expect, it } from "vitest";
import * as bcrypt from "bcryptjs";
import { app } from "../../../app";
import { registerUser } from "../../auth/use-cases/register-user";

type AuthContext = {
  accessToken: string;
};

const createInstructorAndLogin = async (): Promise<AuthContext> => {
  const email = `instructor-${Date.now()}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  await registerUser({ email, passwordHash, role: "instructor" });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);
  return { accessToken: loginResponse.body.accessToken as string };
};

const createStudentAndLogin = async (): Promise<AuthContext> => {
  const email = `student-${Date.now()}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  await registerUser({ email, passwordHash, role: "student" });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);
  return { accessToken: loginResponse.body.accessToken as string };
};

describe("enrollment routes", () => {
  it("enrolls a student in a course and lists enrollments", async () => {
    const instructor = await createInstructorAndLogin();
    const student = await createStudentAndLogin();

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Enrollment 101", summary: "Test enrollment flow." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const enrollResponse = await request(app)
      .post("/api/v1/enrollments")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId });

    expect(enrollResponse.status).toBe(201);

    const duplicateEnroll = await request(app)
      .post("/api/v1/enrollments")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId });

    expect(duplicateEnroll.status).toBe(200);

    const listResponse = await request(app)
      .get("/api/v1/enrollments")
      .set("Authorization", `Bearer ${student.accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items.length).toBeGreaterThan(0);

    const statusResponse = await request(app)
      .get(`/api/v1/enrollments/${courseId}`)
      .set("Authorization", `Bearer ${student.accessToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.enrolled).toBe(true);
  });

  it("returns not enrolled for a course the student has not joined", async () => {
    const instructor = await createInstructorAndLogin();
    const student = await createStudentAndLogin();

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Not Enrolled", summary: "Should not be enrolled." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const statusResponse = await request(app)
      .get(`/api/v1/enrollments/${courseId}`)
      .set("Authorization", `Bearer ${student.accessToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.enrolled).toBe(false);
  });

  it("rejects enrollment without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/enrollments")
      .send({ courseId: "some-id" });

    expect(response.status).toBe(401);
  });
});
