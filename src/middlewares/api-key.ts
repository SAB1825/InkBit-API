import { HTTPSTATUS } from "@/config/http.config";
import logger from "@/lib/winston";
import { ApiKey } from "@/models/v1/api";
import { Organization } from "@/models/v1/organisation";
import { NextFunction, Request, Response } from "express";

export const CheckApiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      res.status(401).json({ success: false, message: "API key is missing" });
      return;
    }
    const apiFromDb = await ApiKey.findOne({
      key: apiKey,
      isActive: true,
    });
    if (!apiFromDb) {
      res
        .status(HTTPSTATUS.BAD_REQUEST)
        .json({ success: false, message: "Invalid or inactive API key" });
      return;
    }

    if (apiKey !== apiFromDb.key) {
      res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ success: false, message: "Unauthorized API key" });
      return;
    }
    const org = await Organization.findOne({
      _id: apiFromDb.orgId,
    });
    if (!org) {
      res
        .status(HTTPSTATUS.BAD_REQUEST)
        .json({ success: false, message: "Invalid organization" });
      return;
    }
    org.usage.apiCallsThisMonth += 1;
    await org.save();
    req.orgId = org._id;
    next();
  } catch (error) {
    logger.error("Error in validating the API key!", error);
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
    return;
  }
};
