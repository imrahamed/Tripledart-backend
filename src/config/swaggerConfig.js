
module.exports = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: require('../swagger/basicInfo'),
    servers: require('../swagger/servers'),
    tags: require('../swagger/tags'),
    components: require('../swagger/components'),
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};
