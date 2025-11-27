import http from "http";
import app from "./app.js";
import prisma from "../PrismaClient.js";
import logger from "../config/logger.js";

const port = Number(process.env.PORT || 3000);
const server = http.createServer(app);

const GRACEFUL_SHUTDOWN_TIMEOUT = 30000; // 30 seconds

class ServerStartupError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "ServerStartupError";
  }
}

// Validate environment
const validateEnvironment = () => {
  const requiredEnvVars = ["DATABASE_URL"];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    throw new ServerStartupError(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Test database connection
const testDatabaseConnection = async (): Promise<void> => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 10000)
    );
    const dbCheckPromise = prisma.$queryRawUnsafe("SELECT 1");
    await Promise.race([dbCheckPromise, timeoutPromise]);
  } catch (err: any) {
    logger.error({
      msg: "Database connection test failed",
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
    throw new ServerStartupError("Database connection failed", err);
  }
};

// Start HTTP server
const startServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      logger.info({ msg: `Server started on port ${port}`, env: process.env.NODE_ENV || "development" });
      resolve();
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(new ServerStartupError(`Port ${port} is already in use`));
      } else {
        reject(new ServerStartupError(`Server error: ${error.message}`, error));
      }
    });
  });
};

// Start function
const start = async () => {
  try {
    logger.info({ msg: "Starting server initialization..." });

    validateEnvironment();
    logger.info({ msg: "Environment validation passed" });

    logger.info({ msg: "Connecting to database..." });
    await prisma.$connect();
    logger.info({ msg: "Prisma ORM connected successfully" });

    logger.info({ msg: "Testing database connection..." });
    await testDatabaseConnection();
    logger.info({ msg: "Database connection verified" });

    logger.info({ msg: "Starting HTTP server..." });
    await startServer();
  } catch (err: any) {
    logger.error({
      msg: "Server startup failed",
      error: {
        message: err.message,
        stack: err.stack,
        originalError: err.originalError,
      },
    });
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info({ msg: `Received ${signal}, starting graceful shutdown...` });

  const shutdownTimeout = setTimeout(() => {
    logger.error({ msg: "Graceful shutdown timeout, forcing exit..." });
    process.exit(1);
  }, GRACEFUL_SHUTDOWN_TIMEOUT);

  try {
    server.close(async () => {
      logger.info({ msg: "HTTP server closed" });
      await prisma.$disconnect();
      logger.info({ msg: "Database connections closed" });
      clearTimeout(shutdownTimeout);
      logger.info({ msg: "Graceful shutdown completed" });
      process.exit(0);
    });

    server.closeIdleConnections?.();
  } catch (err) {
    logger.error({ msg: "Error during graceful shutdown", error: err });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Signal handlers
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Uncaught exception handlers
process.on("uncaughtException", (err) => {
  logger.error({ msg: "Uncaught Exception", error: { message: err.message, stack: err.stack } });
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ msg: "Unhandled Rejection", reason, promise });
  shutdown("unhandledRejection");
});

// Start the server
start();

export default server;