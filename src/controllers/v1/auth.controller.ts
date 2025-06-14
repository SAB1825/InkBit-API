import { CONFIG } from "@/config/env.config";
import { HTTPSTATUS } from "@/config/http.config";
import logger from "@/lib/winston";
import {
  asyncHandler,
  asyncHandlerAndValidation,
} from "@/middlewares/async-handler";
import {
  createUserService,
  loginUserService,
  logoutService,
  refreshTokenService,
} from "@/Services/v1/auth.service";
import { createSuperAdminDto, LoginUserDto } from "@/validations/dtos";
import { Request, Response } from "express";

export const createUserController = asyncHandlerAndValidation(
  createSuperAdminDto,
  "body",
  async (req: Request, res: Response, data) => {
    const orgId = req.orgId;
    if (!orgId) {
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Organization ID is required to create a user",
      });
    }
    const user = await createUserService(data, orgId!);
    logger.info("User created successfully:", user.email);
    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "User created successfully",
      data: {
        user,
      },
    });
  }
);

export const loginController = asyncHandlerAndValidation(
  LoginUserDto,
  "body",
  async (req: Request, res: Response, data) => {
    const { accessToken, refreshToken } = await loginUserService(data);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
      expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "User login successfully",
      data: {
        accessToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const accessToken = await refreshTokenService(token!);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken= req.cookies.refreshToken as string;
    console.log("REFRESH TOKEN", refreshToken);
    await logoutService(refreshToken)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "User logged out successfully",
    });
  }
)