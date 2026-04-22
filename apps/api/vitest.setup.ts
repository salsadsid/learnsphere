import { afterAll, beforeAll, beforeEach } from "vitest";
import { resetRateLimitBuckets } from "./src/shared/rate-limit";

beforeAll(async () => {
  const { connectToDatabase } = await import("./src/shared/db");
  await connectToDatabase();
});

beforeEach(() => {
  resetRateLimitBuckets();
});

afterAll(async () => {
  const { disconnectFromDatabase } = await import("./src/shared/db");
  await disconnectFromDatabase();
});
