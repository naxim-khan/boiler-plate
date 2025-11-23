// src/server/index.ts
import http from "http";
import app from "./app.js";
import prisma from "../PrismaClient.js";   // <- your correct prisma client
import logger from "../config/logger.js";
import { ApiError } from "../common/errors/api-error.js";
import { ERROR_CODES } from "../common/errors/error-codes.js";

const port = Number(process.env.PORT || 3000);
const server = http.createServer(app);

const start = async () => {
  try {
    logger.info("connecting server...")

    // Try Connecting Prisma
    await prisma.$connect();
    logger.info("Prisma connected");

    // forcing real DB to validate it's connected or not?
    try {
      // Quick DB ping
      await prisma.$queryRawUnsafe("SELECT 1");
      logger.info("Database connection verified");

    } catch (error: any) {
      logger.error("Database check failed");
      logger.error(error);

      throw new ApiError(
        503,                                   // HTTP Status
        "Failed to connect to the database",    // Message for API consumers
        ERROR_CODES.DB_CONNECTION_ERROR,        // Your custom error code
        error                                   // Extra details (optional)
      );
    }

    server.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (err) {
    logger.error("Failed to start server");
    logger.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
const graceful = async () => {
  logger.info("Shutting down server...");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Prisma disconnected");
    process.exit(0);
  });
};

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);
