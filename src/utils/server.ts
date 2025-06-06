import logger from "../lib/winston";
import { disconnectFromDatabase } from "../lib/mongoose";

export const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (err) {
    logger.error('Error during server shutdown', err);
  }
};