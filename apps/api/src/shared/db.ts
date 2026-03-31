import mongoose from "mongoose";
import { config } from "./config";

const buildMissingMongoError = (): Error =>
  new Error("MONGODB_URI is required to start the API.");

export const connectToDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!config.mongoUri) {
    throw buildMissingMongoError();
  }

  const options: mongoose.ConnectOptions = {};
  if (config.mongoDbName) {
    options.dbName = config.mongoDbName;
  }

  await mongoose.connect(config.mongoUri, options);
};

export const isDatabaseConnected = (): boolean => mongoose.connection.readyState === 1;

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};
