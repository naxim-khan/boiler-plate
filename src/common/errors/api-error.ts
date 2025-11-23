// src/common/errors/api-error.ts

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    code: string,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Set the error name for cleaner logs
    this.name = "ApiError";

    // Fix prototype chain (required for custom Error subclasses)
    Object.setPrototypeOf(this, ApiError.prototype);

    // Capture cleaner stack traces (Node only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Serialize the error for API responses
  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
