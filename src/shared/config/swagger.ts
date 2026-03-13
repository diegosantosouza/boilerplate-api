import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

export const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Boilerplate API',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/router/*.ts', './src/modules/**/*.ts'],
};

let spec: object;

if (process.env.NODE_ENV !== 'development') {
  const swaggerPath = path.resolve(process.cwd(), 'swagger.json');
  if (fs.existsSync(swaggerPath)) {
    try {
      spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
      console.log('Loaded static Swagger JSON');
    } catch (error) {
      console.error('Failed to load static Swagger JSON:', error);
      spec = swaggerJsdoc(options);
    }
  } else {
    console.warn('Swagger JSON not found in production. Falling back to dynamic generation.');
    spec = swaggerJsdoc(options);
  }
} else {
  spec = swaggerJsdoc(options);
}

export const swaggerSpec = spec;
