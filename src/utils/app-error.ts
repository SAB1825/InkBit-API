import { Organization } from './../models/v1/Authentication/organisation';
import { HTTPSTATUS, HttpStatusCodeType } from "../config/http.config";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enum/error-code.enum";

export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode?: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
    constructor(
        message = "Http Exception Error",
        statusCode: HttpStatusCodeType,
        errorCode?: ErrorCodeEnumType
    ) {
        super(message, statusCode, errorCode);
    }
}

export class InternalServerException extends AppError {
    constructor(
        message = "Internal Server Error",
        ErrorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.INTERNAL_SERVER_ERROR,
            ErrorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR
        );
    }
}

export class NotFoundException extends AppError {
    constructor(message = "Resource not found", ErrorCode?: ErrorCodeEnumType) {
        super(
            message,
            HTTPSTATUS.NOT_FOUND,
            ErrorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND
        );
    }
}

export class OrganizationAlreadyExistsException extends AppError {
    constructor(
        message = "Organization already exists",
        ErrorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.CONFLICT,
            ErrorCode || ErrorCodeEnum.ORGANIZATION_ALREADY_EXISTS
        );
    }
}

export class UserAlreadyExistsException extends AppError {
    constructor(
        message = "User already exists",
        ErrorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.CONFLICT,
            ErrorCode || ErrorCodeEnum.AUTH_USER_ALREADY_EXISTS
        );
    }
}

export class UsageExceededException extends AppError {
    constructor(
        message = "Usage limit exceeded",
        ErrorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.FORBIDDEN,
            ErrorCode || ErrorCodeEnum.ORGANIZATION_USER_LIMIT_EXCEEDED
        );
    }
}