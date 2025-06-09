import { Request } from 'express';
import { Types } from 'mongoose';


declare global {
    namespace Express {
        interface Request {
            orgId?: Types.ObjectId; // Optional organization ID
            userId?: string; // Optional user ID
        }
    }
}
export {};