import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { envVars } from '../config/env';
import AppError from '../errors/AppError';
import { prisma } from '../lib/prisma';
import catchAsync from '../utils/catchAsync';
import { UserRole } from '../../generated/prisma';
import { verifyToken } from '../utils/jwt.utils';

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // ── Token Missing ─────────────────────────────────────────
    if (!authHeader) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Access denied. Please log in to continue.',
      );
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Invalid authorization format. Please use: Bearer <token>',
      );
    }

    // ── Token Verification ────────────────────────────────────
    let decoded;
    try {
      decoded = verifyToken(
        token,
        envVars.JWT.SECRET as string,
      ) as jwt.JwtPayload;
    } catch (err: unknown) {
      const error = err as { name?: string; expiredAt?: Date };
      if (error?.name === 'TokenExpiredError') {
        const decodedExpired = jwt.decode(token) as jwt.JwtPayload;
        console.error('[AUTH] Token expired at:', new Date((decodedExpired?.exp as number) * 1000).toISOString());
      }
      // Re-throw so globalErrorHandler handles it with proper message
      throw err;
    }

    const { role, userId } = decoded;

    // ── User Existence Check ──────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Account not found. The user associated with this token no longer exists.',
      );
    }

    // ── Account Status Checks ─────────────────────────────────
    if (user.isDeleted) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'This account has been permanently deleted. Please contact support if you believe this is a mistake.',
      );
    }

    if (user.accountStatus === 'BLOCKED') {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your account has been blocked due to a policy violation. Please contact our support team for assistance.',
      );
    }

    if (user.accountStatus === 'REJECTED') {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your account registration was rejected. Please contact support for more information.',
      );
    }

    if (user.accountStatus === 'PENDING') {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your account is pending approval. You will be notified once it is activated.',
      );
    }

    // ── Role Authorization Check ──────────────────────────────
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role as UserRole)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied. You do not have permission to perform this action.',
      );
    }

    req.user = decoded;
    next();
  });
};

export default auth;
