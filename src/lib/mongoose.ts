import { NotFoundException } from "@/utils/app-error";
import { CONFIG } from "../config/env.config";
import mongoose, { ConnectOptions } from "mongoose";
import logger from "./winston";

const clientOptions: ConnectOptions = {
  dbName: "inkbit-db",
  appName: "inkbit",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDb = async (): Promise<void> => {
  if (!CONFIG.MONGO_URI) {
    throw new Error("MongoDB URI is not defined in the configuration.");
  }
  try {
    await mongoose.connect(CONFIG.MONGO_URI, clientOptions);
    logger.info("Connected to the database successfully.", {
      uri: CONFIG.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    logger.error("Error connecting to the database", error);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    logger.info('Disconnected from the database successfully.', {
      uri: CONFIG.MONGO_URI,
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    logger.error('Error disconnecting from the database', err);
  }
};
