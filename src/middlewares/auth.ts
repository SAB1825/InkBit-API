import { HTTPSTATUS } from "@/config/http.config";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/winston";
import { UnauthorizedAccessException } from "@/utils/app-error";
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";


export const AuthMiddleware = (req: Request, res : Response, next: NextFunction) => {
  const token = req.headers.authorization;
  console.log(token)
  if (!token) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success : false,
      message : "Token not found."
    })
    return;
  }
  try {
    const decoded = verifyAccessToken(token);
    console.log(decoded)
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error("Error in auth middleware", error);
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedAccessException("Invalid token");
    }
  }
};