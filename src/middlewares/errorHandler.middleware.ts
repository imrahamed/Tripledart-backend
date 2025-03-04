import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('❌ Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
}
