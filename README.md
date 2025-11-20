# Boiler-Plate Node.js + Express + Prisma (TypeScript)

A **Node.js boilerplate** for building scalable REST APIs with **TypeScript**, **Express**, and **Prisma 7+**. Designed for **PostgreSQL**, with a clean architecture, proper logging, error handling, and ready-to-use REST endpoints.

---

## Table of Contents

* [Features](#features)
* [Folder Structure](#folder-structure)
* [Setup Guide](#setup-guide)
* [Environment Variables](#environment-variables)
* [Prisma 7+ Setup & Commands](#prisma-7-setup--commands)
* [Scripts](#scripts)
* [API Routes](#api-routes)
* [Logging](#logging)
* [Error Handling](#error-handling)
* [Common Issues & Fixes](#common-issues--fixes)
* [Contributing](#contributing)
* [References](#references)

---

## Features

* TypeScript support
* Prisma 7+ ORM for PostgreSQL
* Layered architecture: **Controllers → Services → Repositories → Database**
* Express middleware setup: CORS, Helmet, Compression, Morgan
* Graceful shutdown with Prisma connection handling
* Structured logging and centralized error handling
* Ready-to-use REST API for `User` entity
* Production-ready, scalable, and maintainable architecture

---

## Folder Structure

```
boiler-plate/
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Prisma schema definition
│   └── migrations/         # DB migration files
├── src/
│   ├── server/             # Server entry point and Express app
│   │   ├── index.ts        # HTTP server + Prisma connection
│   │   └── app.ts          # Express app configuration
│   ├── api/v1/             # Versioned API routes
│   │   ├── controllers/    # Handle HTTP requests/responses
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database queries using Prisma
│   │   └── routes/         # Express route definitions
│   ├── config/             # Logger, Prisma config, environment config
│   ├── middlewares/        # Express middlewares (404, error handler)
│   └── generated/          # Prisma 7+ generated client
├── package.json
├── tsconfig.json
├── .env
└── prisma.config.ts        # Prisma client configuration
```

**Request Flow:**

```
Client → Route → Controller → Service → Repository → Prisma Client → Database → Response
```

---

## Setup Guide

### 1. Clone the repository

```bash
git clone <repo-url>
cd boiler-plate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=3000
CORS_ORIGIN="*"   # or your frontend URL
NODE_ENV=development
```

### 4. Prisma 7+ Setup (PostgreSQL)

#### Install Prisma packages

```bash
npm install prisma @prisma/client
```

> ⚠️ Do **NOT** install `@prisma/client/driver-adapters` or `@prisma/client-driver-postgres`. Prisma 7+ uses built-in drivers automatically.

#### Initialize Prisma

```bash
npx prisma init
```

#### Generate Prisma client

```bash
npx prisma generate
```

#### Run migrations (PostgreSQL)

```bash
npx prisma migrate dev --name init
```

> This creates tables in your database based on `schema.prisma`.
> You can also use `npx prisma db push` for schema syncing without creating a migration.

#### Open Prisma Studio

```bash
npx prisma studio
```

> View your database visually in the browser.

---

## Prisma 7+ Client Setup (TypeScript)

**Example:** `src/PrismaClient.ts`

```ts
import { PrismaClient } from './generated';
import prismaConfig from '../prisma.config';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

> ✅ Avoid manually setting `adapter` or `accelerateUrl` for PostgreSQL in Prisma 7+.
> [Prisma 7+ Docs: Client](https://www.prisma.io/docs/concepts/components/prisma-client)

---

## Scripts

| Command                  | Description                                 |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Start server with TSX watcher (development) |
| `npm run build`          | Build TypeScript to JavaScript              |
| `npm run start`          | Start production server                     |
| `npx prisma generate`    | Generate Prisma client                      |
| `npx prisma migrate dev` | Apply migrations                            |
| `npx prisma db push`     | Sync schema to DB without migration         |
| `npx prisma studio`      | Open DB UI in browser                       |

---

## API Routes Example

| Method | Route           | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/api/v1/users` | Get all users     |
| POST   | `/api/v1/users` | Create a new user |

**Request Example (POST `/api/v1/users`):**

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-11-20T11:30:00.000Z"
}
```

---

## Logging

* Uses centralized logger (`src/config/logger.ts`)
* Logs server start, Prisma connection, and errors
* Uses `info`, `error`, `warn` levels

---

## Error Handling

* **404 Middleware:** Returns

```json
{ "status": "fail", "message": "Route / not found" }
```

* **Error Handler Middleware:** Returns structured error messages with stack trace (development only)

---

## Common Issues & Fixes

| Issue                                                              | Solution                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `PrismaClientInitializationError: The Driver Adapter undefined...` | Remove `adapter` or `accelerateUrl` from PrismaClient config. Prisma 7+ automatically detects PostgreSQL. |
| `Cannot find package '@prisma/client-driver-postgres'`             | Do not install this manually. Only use `prisma` and `@prisma/client`.                                     |
| `Route / not found`                                                | Ensure your routes are prefixed correctly (`/api/v1/users`).                                              |
| Prisma schema not applied                                          | Run `npx prisma migrate dev --name init` or `npx prisma db push`.                                         |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push branch: `git push origin feature/your-feature`
5. Open Pull Request

---

## References / Links

* [Prisma 7+ Documentation](https://www.prisma.io/docs)
* [Prisma Client Usage](https://www.prisma.io/docs/concepts/components/prisma-client)
* [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
* [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)
* [Express.js Documentation](https://expressjs.com/)
* [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---
