import { Prisma } from "../generated/prisma/client";
import { ApiError } from "../common/errors/api-error";
import { ERROR_CODES } from "../common/errors/error-codes";

export function handlePrismaError(err: any): ApiError {
  // Log the original error for debugging
  console.error('Prisma Error:', err);

  // -------------------------------
  // 1. Known Prisma Request Errors
  // -------------------------------
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Unique constraint failed
      case "P2002": {
        const target = err.meta?.target;
        const fieldName = Array.isArray(target) 
          ? target.join(', ') 
          : String(target || 'unknown field');
        
        return new ApiError(
          409,
          `A record with this ${fieldName} already exists`,
          ERROR_CODES.DUPLICATE_VALUE,
          { field: fieldName }
        );
      }

      // Record not found
      case "P2025":
        return new ApiError(
          404,
          "The requested record was not found",
          ERROR_CODES.NOT_FOUND,
          { resource: err.meta?.model || 'Record' }
        );

      // Foreign key constraint failed
      case "P2003":
        return new ApiError(
          400,
          "Invalid reference: The related record does not exist",
          ERROR_CODES.DB_QUERY_FAILED,
          { constraint: err.meta?.field_name }
        );

      // Invalid data format
      case "P2005":
      case "P2006":
        return new ApiError(
          400,
          "Invalid data format provided",
          ERROR_CODES.INVALID_INPUT,
          { field: err.meta?.field_name }
        );

      // Query interpretation error
      case "P2010":
      case "P2016":
        return new ApiError(
          400,
          "Database query error",
          ERROR_CODES.DB_QUERY_FAILED,
          { details: err.meta?.details }
        );

      // Invalid enum value
      case "P2023":
        return new ApiError(
          400,
          "Invalid value provided",
          ERROR_CODES.INVALID_INPUT,
          { field: err.meta?.field_name }
        );

      // Database connection errors
      case "P1000":
      case "P1001":
      case "P1002":
      case "P1003":
      case "P1008":
      case "P1009":
        return new ApiError(
          503,
          "Database service unavailable",
          ERROR_CODES.DB_CONNECTION_ERROR,
          { code: err.code }
        );

      // Timeout errors
      case "P1004":
      case "P1020":
        return new ApiError(
          408,
          "Database operation timed out",
          ERROR_CODES.DB_TIMEOUT,
          { code: err.code }
        );

      default:
        return new ApiError(
          500,
          `Database error: ${err.code}`,
          ERROR_CODES.DB_QUERY_FAILED,
          { code: err.code }
        );
    }
  }

  // ---------------------------------------
  // 2. Prisma Validation Errors
  // ---------------------------------------
  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(
      400,
      "Invalid request data format",
      ERROR_CODES.VALIDATION_ERROR,
      { message: "Check that all required fields are provided and have correct types" }
    );
  }

  // ---------------------------------------
  // 3. Prisma Initialization Errors
  // ---------------------------------------
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new ApiError(
      503,
      "Database initialization failed",
      ERROR_CODES.DB_CONNECTION_ERROR,
      { errorCode: err.errorCode }
    );
  }

  // ---------------------------------------
  // 4. Unknown Prisma Errors
  // ---------------------------------------
  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    return new ApiError(
      500,
      "Unknown database error occurred",
      ERROR_CODES.UNKNOWN_ERROR
    );
  }

  // ---------------------------------------
  // 5. If it's already an ApiError, return it
  // ---------------------------------------
  if (err instanceof ApiError) {
    return err;
  }

  // ---------------------------------------
  // 6. Fallback for any other errors
  // ---------------------------------------
  return new ApiError(
    500,
    "An unexpected error occurred",
    ERROR_CODES.INTERNAL,
    process.env.NODE_ENV === 'development' ? { originalError: err.message } : undefined
  );
}