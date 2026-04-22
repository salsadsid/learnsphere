import { config } from "./shared/config";
import { app } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./shared/db";
import { seedAdmin } from "./modules/auth/use-cases/seed-admin";
import { seedDemoCourse } from "./modules/courses/use-cases/seed-demo-course";
import { logger } from "./shared/logger";

const port = config.port;

const startServer = async (): Promise<void> => {
  await connectToDatabase();
  await seedAdmin({
    ...(config.adminEmail !== undefined ? { email: config.adminEmail } : {}),
    ...(config.adminPassword !== undefined ? { password: config.adminPassword } : {}),
  });

  await seedDemoCourse({
    enabled: config.demoSeedEnabled,
    ...((config.demoInstructorEmail ?? config.adminEmail) !== undefined
      ? { instructorEmail: config.demoInstructorEmail ?? config.adminEmail }
      : {}),
  });

  const server = app.listen(port, () => {
    logger.info({ port }, "API started");
  });

  const shutdown = async () => {
    server.close();
    await disconnectFromDatabase();
  };

  process.on("SIGINT", () => {
    shutdown().catch((err) => logger.error({ err }, "shutdown failed"));
  });

  process.on("SIGTERM", () => {
    shutdown().catch((err) => logger.error({ err }, "shutdown failed"));
  });
};

startServer().catch((err) => {
  logger.error({ err }, "failed to start server");
  process.exit(1);
});
