

import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
    PORT : process.env.PORT || 8000,
    NODE_ENV : process.env.NODE_ENV,
    MONGO_URI : process.env.MONGO_URI,
    WHITELIST_ORIGINS : ["http://localhost:3000"],
    JWT_ACCESS_SECRET : process.env.JWT_ACCESS_SECRET || "access_secret",
    JWT_REFRESH_SECRET : process.env.JWT_REFRESH_SECRET || "refresh_secret",
    ACCESS_TOKEN_EXPIRY : process.env.ACCESS_TOKEN_EXPIRY || "1h",
    REFRESH_TOKEN_EXPIRY : process.env.REFRESH_TOKEN_EXPIRY || "30d"
}