import 'reflect-metadata';

export function SwaggerDocs(docs: any) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    if (!Reflect.hasMetadata('swaggerDocs', target.constructor)) {
      Reflect.defineMetadata('swaggerDocs', {}, target.constructor);
    }
    const swaggerDocs = Reflect.getMetadata('swaggerDocs', target.constructor);
    swaggerDocs[key] = docs;
    Reflect.defineMetadata('swaggerDocs', swaggerDocs, target.constructor);
  };
}
