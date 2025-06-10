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
  constructor(message = "Internal Server Error", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.NOT_FOUND, errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND);
  }
}

export class OrganizationAlreadyExistsException extends AppError {
  constructor(message = "Organization already exists", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.CONFLICT, errorCode || ErrorCodeEnum.ORGANIZATION_ALREADY_EXISTS);
  }
}

export class UserAlreadyExistsException extends AppError {
  constructor(message = "User already exists", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.CONFLICT, errorCode || ErrorCodeEnum.AUTH_USER_ALREADY_EXISTS);
  }
}

export class UsageExceededException extends AppError {
  constructor(message = "Usage limit exceeded", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.FORBIDDEN, errorCode || ErrorCodeEnum.ORGANIZATION_USER_LIMIT_EXCEEDED);
  }
}

export class UserNotFoundException extends AppError {
  constructor(message = "User not found", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.NOT_FOUND, errorCode || ErrorCodeEnum.AUTH_USER_NOT_FOUND);
  }
}

export class InvalidPasswordException extends AppError {
  constructor(message = "Password is incorrect", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.UNAUTHORIZED, errorCode || ErrorCodeEnum.AUTH_PASSWORD_INVALID);
  }
}

export class UnauthorizedAccessException extends AppError {
  constructor(message = "Unauthorized access", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.UNAUTHORIZED, errorCode || ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS);
  }
}

export class TokenExpiredException extends AppError {
  constructor(message = "Authentication token has expired", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.UNAUTHORIZED, errorCode || ErrorCodeEnum.AUTH_TOKEN_EXPIRED);
  }
}

export class InvalidTokenException extends AppError {
  constructor(message = "Invalid token", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.UNAUTHORIZED, errorCode || ErrorCodeEnum.AUTH_INVALID_TOKEN);
  }
}
