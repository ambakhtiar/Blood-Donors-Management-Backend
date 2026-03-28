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
    
    // missing token
    if (!authHeader) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token format!');
    }

    const decoded = verifyToken(
      token,
      envVars.JWT.SECRET as string,
    ) as jwt.JwtPayload;


    const { role, userId } = decoded;

    // check user existence
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
    }

    // check if user is deleted
    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
    }

    // check if user is blocked
    if (user.accountStatus === 'BLOCKED') {
      throw new AppError(httpStatus.FORBIDDEN, 'This account is blocked. Unauthorized access.');
    }

    if (user.accountStatus === 'REJECTED') {
      throw new AppError(httpStatus.FORBIDDEN, 'This account is rejected.');
    }

    // role checking
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role as UserRole)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You have no access to this route',
      );
    }

    // attaching user payload to request
    req.user = decoded;
    next();
  });
};

export default auth;
