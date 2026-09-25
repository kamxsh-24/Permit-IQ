import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200
): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors?: any
): Response {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
}
