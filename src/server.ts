import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

import { CONFIG } from "./config/env.config";
import logger from "./lib/winston";
import { corsOptions } from "./lib/cors";
import limiter from "./lib/express-rate-limit";
import { connectToDb } from "./lib/mongoose";
import { ErrorHandler } from "./middlewares/error-handler";
import { handleServerShutdown } from "./utils/server";
import { InternalServerException } from "./utils/app-error";

const app = express();

app.use(cors(corsOptions));
app.use(limiter);
app.use(
  compression({
    threshold: 1024,
  })
);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  throw new InternalServerException("sercer broke");
  res.status(200).send("OK");
});

(async () => {
  try {
    await connectToDb();
    // TODO: ADD ROUTES
    app.use(ErrorHandler);
    const PORT = CONFIG.PORT;
    app.listen(PORT, () => {
      logger.info(`Server started at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
  }
})();

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
