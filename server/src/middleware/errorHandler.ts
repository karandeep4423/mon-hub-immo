import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (
    err.name === 'MongoServerError' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (err as any).code !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).code === 11000
  ) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};
