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
        // add other schemas as needed (CreateUser, UpdateUser, etc.)
      },
    },
  },
  apis: ['./src/routes/**/*.ts'], // path to route files
};


export const swaggerDocs = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};