// src/server/index.ts
import http from "http";
import app from "./app.js";
import prisma from "../PrismaClient.js";   // <- your correct prisma client
import logger from "../config/logger.js";

const port = Number(process.env.PORT || 3000);
const server = http.createServer(app);

const start = async () => {
  try {
    await prisma.$connect();
    logger.info("Prisma connected");

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
