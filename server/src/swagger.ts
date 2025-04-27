// src/swagger.ts
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Define the swagger options type
interface SwaggerOptions {
  swaggerDefinition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
    };
    servers: Array<{ url: string }>;
  };
  apis: string[];
}

const swaggerOptions: SwaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Dendrite Whiteboard API',
      version: '1.0.0',
      description: 'API documentation for the Dendrite Whiteboard application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8088}/`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };