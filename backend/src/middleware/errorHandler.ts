import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/apiResponse.js';
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
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

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
    return sendError(res, 'Validation Error', 400, formattedErrors);
  }

  // Prisma Known Request Error Handler
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        return sendError(res, `Unique constraint violation: ${target} already exists`, 409);
      }
      case 'P2025': {
        return sendError(res, 'Requested database record not found', 404);
      }
      case 'P2003': {
        return sendError(res, 'Foreign key constraint violation', 400);
      }
      default:
        return sendError(res, `Database operation failed (Code ${err.code})`, 400);
    }
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode);
}

export default errorHandler;
