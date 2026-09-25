import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError, AppError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  logger.error('Unhandled Exception Caught:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Custom Application Error
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Zod Validation Error Handler
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    err.errors.forEach((issue) => {
      const field = issue.path.join('.') || 'request';
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(issue.message);
    });
    return sendError(res, 'Validation Error', 400, 'VALIDATION_ERROR', formattedErrors);
  }

  // Prisma Known Request Error Handler
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        return sendError(res, `Unique constraint violation: ${target} already exists`, 409, 'UNIQUE_CONSTRAINT_VIOLATION');
      }
      case 'P2025': {
        return sendError(res, 'Requested database record not found', 404, 'NOT_FOUND');
      }
      case 'P2003': {
        return sendError(res, 'Foreign key constraint violation: referenced record does not exist', 400, 'FOREIGN_KEY_VIOLATION');
      }
      default:
        return sendError(res, `Database operation failed (Code ${err.code})`, 400, 'DATABASE_ERROR');
    }
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';
  return sendError(res, message, statusCode, code);
}

export default errorHandler;
