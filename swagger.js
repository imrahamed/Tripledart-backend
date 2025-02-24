
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerConfig = require('./src/config/swaggerConfig');

const specs = swaggerJsdoc(swaggerConfig);
module.exports = specs;
