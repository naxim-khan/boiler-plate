import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Boilerplate API',
      version: '1.0.0',
      description: 'API documentation for Auth and user collections',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' },
    ],
    components: {
      schemas: {
        Register: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        UpdateSelf: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            password: { type: 'string', example: 'newpassword123' },
          },
        },
        // ===== Add User schema =====
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Nazeem Khan' },
            email: { type: 'string', format: 'email', example: 'nazeem@gmail.com' },
            role: { type: 'string', enum: ['ADMIN', 'MODERATOR', 'USER'], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-01-02T12:00:00Z' },
          },
        },
        // Optional: Paginated response
        UsersResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
            nextCursor: {
              type: 'integer',
              nullable: true,
              description: 'Cursor for next page (null if no more users)',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'], // path to route files
};

export const swaggerDocs = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};