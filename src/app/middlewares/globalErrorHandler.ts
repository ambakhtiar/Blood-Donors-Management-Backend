import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../errors/AppError';
import { Prisma } from '../../generated/prisma';

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: { path: string | number; message: string }[] = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1] as string | number,
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === 'P2002') {
      message = 'Duplicate field value entered';
      const target = err.meta?.target as string[];
      errorSources = target
        ? [{ path: target[0], message: `${target[0]} already exists` }]
        : [{ path: '', message: 'Unique constraint violation' }];
    } else if (err.code === 'P2025') {
      message = 'Record not found';
      errorSources = [{ path: '', message: err.message }];
    } else {
      message = 'Prisma Client Error';
      errorSources = [{ path: '', message: err.message }];
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Prisma Validation Error';
    errorSources = [
      {
        path: '',
        message: err.message.split('\n').pop() || 'Invalid data format provided to database',
      },
    ];
  } else if (err?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your access token has expired. Please refresh it.';
    errorSources = [{ path: '', message: 'jwt expired' }];
  } else if (err?.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
    errorSources = [{ path: '', message: 'Your token is invalid or malformed' }];
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
