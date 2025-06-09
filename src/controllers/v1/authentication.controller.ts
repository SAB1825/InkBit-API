import { HTTPSTATUS } from "@/config/http.config";
import logger from "@/lib/winston";
import { asyncHandlerAndValidation } from "@/middlewares/async-handler";
import {  createUserService} from "@/Services/v1/user.service";
import { createSuperAdminDto } from "@/validations/dtos";
import { Request, Response } from "express";


export const createUserController = asyncHandlerAndValidation(
    createSuperAdminDto,
    "body",
    async(req : Request, res: Response, data) => {
       const user = await createUserService(data)
       logger.info("User created successfully:", user.email);
       res.status(HTTPSTATUS.CREATED).json({
        success  : true,
        message: "Super Admin created successfully",
        data : {
            user  
        }
       })
    }
)