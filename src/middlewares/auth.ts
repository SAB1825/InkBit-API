import { HTTPSTATUS } from "@/config/http.config";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/winston";
import { User } from "@/models/v1/user";
import { NextFunction, Request, Response } from "express";


export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
     res.status(HTTPSTATUS.UNAUTHORIZED).json({
      success: false,
      message: "Access token required"
    });
    return
  }
  
  try {
    const decoded = verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
       res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User not found"
      });
      return
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error("Error in auth middleware", error);
     res.status(HTTPSTATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid token"
    });
    return
  }
};