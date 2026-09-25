import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { UserRole } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required: Missing or malformed authorization header', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication required: Missing token', 401, 'UNAUTHORIZED'));
  }

  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Operation requires one of [${allowedRoles.join(', ')}] role(s). Your role is ${req.user.role}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
