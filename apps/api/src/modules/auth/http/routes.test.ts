import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../../app";

describe("auth routes", () => {
  it("handles a basic auth flow", async () => {
    const email = `user-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toMatchObject({ email });

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(typeof loginResponse.body.accessToken).toBe("string");
    expect(typeof loginResponse.body.refreshToken).toBe("string");

    const accessToken = loginResponse.body.accessToken as string;
    const refreshToken = loginResponse.body.refreshToken as string;

    const meResponse = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toMatchObject({ email });

    const refreshResponse = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(typeof refreshResponse.body.accessToken).toBe("string");
    expect(typeof refreshResponse.body.refreshToken).toBe("string");

    const logoutResponse = await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken: refreshResponse.body.refreshToken });

    expect(logoutResponse.status).toBe(204);
  });
});
