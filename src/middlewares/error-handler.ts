import {ErrorRequestHandler} from "express";
import {HTTPSTATUS} from "../config/http.config";
import {AppError} from "../utils/app-error";


export const ErrorHandler : ErrorRequestHandler = (err, req, res, next) :  any => {
    console.error(`Error Occured at PATH : ${req.path}`, err);



    if(err instanceof SyntaxError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message : "Invalid JSON payload passed",
            error : err?.message || "Something went wrong"
        })
    }

    if(err instanceof AppError) {
        return res.status(err.statusCode).json({
            message : err.message,
            ErrorCode : err.errorCode
        })
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message : "Internal Server Error",
        error : err?.message || "Something went wrong"
    })
}