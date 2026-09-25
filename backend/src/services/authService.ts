import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';
import config from '../config/index.js';
import { JWTPayload, UserRole } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';

export class AuthService {
  public static signToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  public static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new AppError('Authentication failed: Token has expired', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Authentication failed: Invalid token', 401, 'INVALID_TOKEN');
    }
  }

  public static async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        area: {
          include: {
            plant: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      areaId: user.areaId,
      name: user.name,
    };

    const token = AuthService.signToken(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        areaId: user.areaId,
        area: user.area ? {
          id: user.area.id,
          name: user.area.name,
          plantId: user.area.plantId,
          plant: {
            id: user.area.plant.id,
            name: user.area.plant.name,
            code: user.area.plant.code,
          },
        } : null,
      },
    };
  }

  public static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        area: {
          include: {
            plant: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      areaId: user.areaId,
      area: user.area ? {
        id: user.area.id,
        name: user.area.name,
        plantId: user.area.plantId,
        plant: {
          id: user.area.plant.id,
          name: user.area.plant.name,
          code: user.area.plant.code,
        },
      } : null,
      createdAt: user.createdAt,
    };
  }
}
