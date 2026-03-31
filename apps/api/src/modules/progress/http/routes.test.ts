import request from "supertest";
import { describe, expect, it } from "vitest";
import * as bcrypt from "bcryptjs";
import { app } from "../../../app";
import { registerUser } from "../../auth/use-cases/register-user";

type AuthContext = {
  accessToken: string;
  email?: string;
};

const createInstructorAndLogin = async (): Promise<AuthContext> => {
  const email = `instructor-${Date.now()}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  registerUser({ email, passwordHash, role: "instructor" });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return { accessToken: loginResponse.body.accessToken as string, email };
};

const createStudentAndLogin = async (): Promise<AuthContext> => {
  const email = `student-${Date.now()}@example.com`;
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);
  registerUser({ email, passwordHash, role: "student" });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return { accessToken: loginResponse.body.accessToken as string, email };
};

describe("progress routes", () => {
  it("saves video progress and marks lesson completion", async () => {
    const auth = await createInstructorAndLogin();

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ title: "Progress Path", summary: "Track lesson progress." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const moduleResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ title: "Start Here" });

    expect(moduleResponse.status).toBe(201);
    const moduleId = moduleResponse.body.id as string;

    const lessonResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ title: "Lesson One", durationMinutes: 5 });

    expect(lessonResponse.status).toBe(201);
    const lessonId = lessonResponse.body.id as string;

    const progressResponse = await request(app)
      .post("/api/v1/progress")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({
        videoId: lessonId,
        positionSeconds: 20,
        durationSeconds: 120,
      });

    expect(progressResponse.status).toBe(200);
    expect(progressResponse.body.accepted).toBe(true);

    const completionResponse = await request(app)
      .post("/api/v1/progress/completions")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ courseId, lessonId });

    expect(completionResponse.status).toBe(201);
    expect(completionResponse.body.lessonId).toBe(lessonId);

    const courseProgressResponse = await request(app)
      .get(`/api/v1/progress/course/${courseId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(courseProgressResponse.status).toBe(200);
    expect(courseProgressResponse.body.totalLessons).toBe(1);
    expect(courseProgressResponse.body.completedLessons).toBe(1);
    expect(courseProgressResponse.body.percentComplete).toBe(100);
    expect(courseProgressResponse.body.completedLessonIds).toContain(lessonId);

    const completionsListResponse = await request(app)
      .get(`/api/v1/progress/completions/${courseId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(completionsListResponse.status).toBe(200);
    expect(completionsListResponse.body.length).toBe(1);
  });

  it("returns instructor course progress and CSV", async () => {
    const instructor = await createInstructorAndLogin();
    const student = await createStudentAndLogin();

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Instructor Report", summary: "Track student progress." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const moduleResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules`)
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Module One" });

    expect(moduleResponse.status).toBe(201);
    const moduleId = moduleResponse.body.id as string;

    const lessonResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons`)
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Lesson One", durationMinutes: 5 });

    expect(lessonResponse.status).toBe(201);
    const lessonId = lessonResponse.body.id as string;

    const enrollResponse = await request(app)
      .post("/api/v1/enrollments")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId });

    expect(enrollResponse.status).toBe(201);

    const snapshotResponse = await request(app)
      .post("/api/v1/progress/snapshots")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({
        courseId,
        lessonId,
        positionSeconds: 42,
        durationSeconds: 100,
      });

    expect(snapshotResponse.status).toBe(201);

    const eventResponse = await request(app)
      .post("/api/v1/progress/events")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId, lessonId, eventType: "play", positionSeconds: 1 });

    expect(eventResponse.status).toBe(201);

    const completionResponse = await request(app)
      .post("/api/v1/progress/completions")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId, lessonId });

    expect(completionResponse.status).toBe(201);

    const progressResponse = await request(app)
      .get(`/api/v1/progress/instructor/course/${courseId}`)
      .set("Authorization", `Bearer ${instructor.accessToken}`);

    expect(progressResponse.status).toBe(200);
    expect(progressResponse.body.students.length).toBe(1);
    expect(progressResponse.body.students[0].completedLessons).toBe(1);
    expect(progressResponse.body.engagement.totalLearners).toBe(1);

    const csvResponse = await request(app)
      .get(`/api/v1/progress/instructor/course/${courseId}/export`)
      .set("Authorization", `Bearer ${instructor.accessToken}`);

    expect(csvResponse.status).toBe(200);
    expect(csvResponse.text).toContain(student.email as string);
  });

  it("returns student dashboard summary with watch time", async () => {
    const instructor = await createInstructorAndLogin();
    const student = await createStudentAndLogin();

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Student Metrics", summary: "Analytics overview." });

    expect(courseResponse.status).toBe(201);
    const courseId = courseResponse.body.id as string;

    const moduleResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules`)
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Module One" });

    expect(moduleResponse.status).toBe(201);
    const moduleId = moduleResponse.body.id as string;

    const lessonResponse = await request(app)
      .post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons`)
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ title: "Lesson One", durationMinutes: 6 });

    expect(lessonResponse.status).toBe(201);
    const lessonId = lessonResponse.body.id as string;

    const enrollResponse = await request(app)
      .post("/api/v1/enrollments")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId });

    expect(enrollResponse.status).toBe(201);

    const snapshotResponse = await request(app)
      .post("/api/v1/progress/snapshots")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({
        courseId,
        lessonId,
        positionSeconds: 75,
        durationSeconds: 120,
      });

    expect(snapshotResponse.status).toBe(201);

    const completionResponse = await request(app)
      .post("/api/v1/progress/completions")
      .set("Authorization", `Bearer ${student.accessToken}`)
      .send({ courseId, lessonId });

    expect(completionResponse.status).toBe(201);

    const summaryResponse = await request(app)
      .get("/api/v1/progress/student/summary")
      .set("Authorization", `Bearer ${student.accessToken}`);

    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body.totals.totalCourses).toBe(1);
    expect(summaryResponse.body.courses[0].courseId).toBe(courseId);
    expect(summaryResponse.body.courses[0].watchTimeSeconds).toBeGreaterThan(0);
  });
});
