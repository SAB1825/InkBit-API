import { Types } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import { CONFIG } from "@/config/env.config";

interface TokenPayload {
  userId: string; 
  orgId?: string;
  sub: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = {
    userId: userId,
    sub: 'accessToken'
  };

  const options: SignOptions = {
    expiresIn: "1h"
  };

  return jwt.sign(
    payload,
    CONFIG.JWT_ACCESS_SECRET,
    options
  );
};

export const generateRefreshToken = (userId:string): string => {
  const payload: TokenPayload = {
    userId: userId,
    sub: 'refreshToken'
  };

  const options: SignOptions = {
    expiresIn: "30d"
  };

  return jwt.sign(
    payload,
    CONFIG.JWT_REFRESH_SECRET,
    options
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, CONFIG.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as TokenPayload;
};