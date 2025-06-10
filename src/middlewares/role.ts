import { HTTPSTATUS } from "@/config/http.config";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/winston";
import { User } from "@/models/v1/Authentication/user";
import { UnauthorizedAccessException } from "@/utils/app-error";
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

export const AdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: true,
      message: "token not found.",
    });
    return;
  }
  try {
    const decoded = verifyAccessToken(token);
    console.log(decoded);
    req.userId = decoded.userId;

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "User not found.",
      });
      return;
    }
    if (user?.role !== "admin") {
      logger.error(
        `User with role : ${user?.role} tried to access a restricted route`
      );
      res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "Not authorized to do this operation.",
      });
      return;
    }
    next();
  } catch (error) {
    logger.error("Error in auth middleware", error);
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedAccessException("Invalid token");
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong.",
      });
      return;
  }
};
