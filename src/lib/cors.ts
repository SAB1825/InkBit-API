import { CONFIG } from "../config/env.config";
import { CorsOptions } from "cors";
import logger from "./winston";

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      CONFIG.NODE_ENV === 'development' ||
      !origin ||
      CONFIG.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
};