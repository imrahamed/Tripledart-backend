import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('❌ Error:', err);
  
  // If it's an ApiError, use its status code and message
  if (err instanceof ApiError) {
     res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Default to 500 for unhandled errors
  res.status(500).json({ 
    success: false,
    message: err.message || 'Internal Server Error' 
  });
}
