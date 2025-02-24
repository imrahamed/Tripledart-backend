
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';

function generateSwaggerDocs() {
  const controllersPath = path.join(__dirname, '../api/controllers');
  const files = fs.readdirSync(controllersPath);

  const swaggerDocs = {};

  files.forEach((file) => {
    if (file.endsWith('.controller.ts')) {
      const controllerPath = path.join(controllersPath, file);
      const controller = require(controllerPath);
      const instance = new controller[Object.keys(controller)[0]]();
      console.log(JSON.stringify(controller, null, 2));
      const docs = Reflect.getMetadata('swaggerDocs', instance.constructor);
      console.log(docs)
      if (docs) {
        Object.assign(swaggerDocs, docs);
      }
    }
  });

  fs.writeFileSync(
    path.join(__dirname, '../swagger/routes.json'),
    JSON.stringify(swaggerDocs, null, 2)
  );
}

generateSwaggerDocs();
