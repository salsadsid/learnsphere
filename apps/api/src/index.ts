import { config } from "./shared/config";
import { app } from "./app";
import { seedAdmin } from "./modules/auth/use-cases/seed-admin";

const port = config.port;

const startServer = async (): Promise<void> => {
  await seedAdmin({
    ...(config.adminEmail !== undefined ? { email: config.adminEmail } : {}),
    ...(config.adminPassword !== undefined ? { password: config.adminPassword } : {}),
  });

  app.listen(port, () => {
    console.log(`API running on ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server.", error);
  process.exit(1);
});
