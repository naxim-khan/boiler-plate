export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  INTERNAL: "INTERNAL_SERVER_ERROR",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",

  BAD_REQUEST: "BAD_REQUEST",                // Invalid input / invalid enum / invalid query
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR", // Database down / can't connect
  DB_QUERY_FAILED: "DB_QUERY_FAILED",         // Query interpretation errors / relation errors
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
