import { config } from "./shared/config";
import { app } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./shared/db";
import { seedAdmin } from "./modules/auth/use-cases/seed-admin";
import { seedDemoCourse } from "./modules/courses/use-cases/seed-demo-course";

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
    console.log(`API running on ${port}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectFromDatabase();
  };

  process.on("SIGINT", () => {
    shutdown().catch((error) => console.error("Failed to shutdown.", error));
  });

  process.on("SIGTERM", () => {
    shutdown().catch((error) => console.error("Failed to shutdown.", error));
  });
};

startServer().catch((error) => {
  console.error("Failed to start server.", error);
  process.exit(1);
});
