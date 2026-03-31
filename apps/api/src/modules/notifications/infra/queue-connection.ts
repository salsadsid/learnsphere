import { config } from "../../../shared/config";

type QueueConnection = {
  provider: "stub";
  redisUrl?: string;
};

let connection: QueueConnection | null = null;

export const getQueueConnection = (): QueueConnection => {
  if (connection) {
    return connection;
  }

  connection = {
    provider: "stub",
    ...(config.redisUrl ? { redisUrl: config.redisUrl } : {}),
  };

  return connection;
};
