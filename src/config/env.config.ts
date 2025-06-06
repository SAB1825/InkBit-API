

import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
    PORT : process.env.PORT || 8000,
    NODE_ENV : process.env.NODE_ENV,
    MONGO_URI : process.env.MONGO_URI,
    WHITELIST_ORIGINS : ["http://localhost:3000"]
}