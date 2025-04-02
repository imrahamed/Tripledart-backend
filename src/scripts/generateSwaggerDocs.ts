import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

// Import all swagger documentation files
import '../swagger/auth.swagger';
import '../swagger/influencer.swagger';
import '../swagger/campaign.swagger';
import '../swagger/analytics.swagger';
import '../swagger/user.swagger';
import '../swagger/revenue.swagger';
import '../swagger/content.swagger';
import '../swagger/clientRelationship.swagger';
import '../swagger/insightiq.swagger';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tripledart API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Tripledart platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
  },
  apis: ['./src/swagger/*.ts'], // Path to the swagger documentation files
};

const swaggerSpec = swaggerJsdoc(options);

// Write the swagger spec to a JSON file
const outputPath = path.join(__dirname, '../swagger/routes.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('✅ Swagger documentation generated successfully!');
