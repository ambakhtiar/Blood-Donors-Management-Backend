import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { verifyToken } from '../utils/jwt.utils';
import { prisma } from '../lib/prisma';
import catchAsync from '../utils/catchAsync';
import { UserRole } from '../../generated/prisma';

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // missing token
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const decoded = verifyToken(
      token,
      config.jwt.secret as string,
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

    // check if user is blocked or rejected
    if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
      throw new AppError(httpStatus.FORBIDDEN, `This user is ${user.accountStatus.toLowerCase()}`);
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
