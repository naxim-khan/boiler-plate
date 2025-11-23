import { Prisma } from "../generated";
import { ApiError } from "../common/errors/api-error";
import { ERROR_CODES } from "../common/errors/error-codes";

export function handlePrismaError(err: any) {

  // -------------------------------
  // 1. Known Prisma Request Errors
  // -------------------------------
  if (err instanceof Prisma.PrismaClientKnownRequestError) {

    switch (err.code) {

      // Unique constraint failed
      case "P2002":
        return new ApiError(
          409,
          `Duplicate value for field: ${err.meta?.target}`,
          ERROR_CODES.DUPLICATE_VALUE
        );

      // Record not found
      case "P2025":
        return new ApiError(
          404,
          "Record not found",
          ERROR_CODES.NOT_FOUND
        );

      // Foreign key constraint
      case "P2003":
        return new ApiError(
          400,
          "Foreign key constraint failed",
          ERROR_CODES.DB_QUERY_FAILED
        );

      // Query interpretation errors
      case "P2010":
        return new ApiError(
          400,
          "Invalid query or invalid data sent to DB",
          ERROR_CODES.DB_QUERY_FAILED
        );

      // Value does not exist in enum
      case "P2023":
        return new ApiError(
          400,
          "Invalid enum value or incorrect parameter",
          ERROR_CODES.BAD_REQUEST
        );

      // General database error
      case "P1001":
        return new ApiError(
          503,
          "Cannot reach the database server",
          ERROR_CODES.DB_CONNECTION_ERROR
        );

      default:
        return new ApiError(
          500,
          `Prisma Error: ${err.code}`,
          ERROR_CODES.UNKNOWN_ERROR
        );
    }
  }

  // ---------------------------------------
  // 2. Prisma Validation Errors (Schema/Query)
  // ---------------------------------------
  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(
      400,
      "Invalid request data (Prisma validation failed)",
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // ---------------------------------------
  // 3. Prisma Initialization (DB connection)
  // ---------------------------------------
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new ApiError(
      503,
      "Database initialization error (Check connection & credentials)",
      ERROR_CODES.DB_CONNECTION_ERROR
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
  // 5. Fallback
  // ---------------------------------------
  return new ApiError(
    500,
    "Internal server error",
    ERROR_CODES.INTERNAL
  );
}
