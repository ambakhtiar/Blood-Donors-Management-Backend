import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../errors/AppError';
import { Prisma } from '../../generated/prisma';

/* ─────────────────────────────────────────────
   Helper: Convert camelCase field names to
   readable labels (e.g. "contactNumber" → "Contact Number")
───────────────────────────────────────────── */
const toReadableField = (field: string): string => {
  const knownFields: Record<string, string> = {
    email: 'Email address',
    contactNumber: 'Contact number',
    registrationNumber: 'Registration number',
    transactionId: 'Transaction ID',
    password: 'Password',
    name: 'Name',
    bloodGroup: 'Blood group',
    postId: 'Post ID',
    parentId: 'Parent comment ID',
    content: 'Comment content',
    userId: 'User ID',
  };
  return (
    knownFields[field] ||
    field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  );
};

/* ─────────────────────────────────────────────
   Helper: Clean up Zod error message paths to
   readable text (e.g. "body > bloodGroup")
───────────────────────────────────────────── */
const formatZodPath = (path: (string | number)[]): string => {
  const filtered = path.filter((p) => p !== 'body' && p !== 'cookies');
  if (filtered.length === 0) return 'request';
  return filtered.map((p) => toReadableField(String(p))).join(' > ');
};

/* ─────────────────────────────────────────────
   Main Global Error Handler
───────────────────────────────────────────── */
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Defaults
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again later.';
  let errorSources: { path: string | number; message: string }[] = [
    { path: 'server', message: 'Something went wrong on our end.' },
  ];

  // ── 1. Zod Validation Error ──────────────────────────────────
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Please check the information you provided and try again.';
    errorSources = err.issues.map((issue) => ({
      path: formatZodPath(issue.path as (string | number)[]),
      message: issue.message,
    }));
  }

  // ── 2. Prisma Known Request Errors ──────────────────────────
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    // P2002 → Unique constraint violation
    if (err.code === 'P2002') {
      let field = (err.meta?.target as string[])?.[0] || '';

      // Fallback if `target` is not available
      if (!field && err.message.includes('fields:')) {
        const match = err.message.match(/fields: \(`"(.+)"`\)/);
        if (match) field = match[1];
      }

      const readableField = toReadableField(field) || 'This value';
      message = `${readableField} is already registered. Please use a different one.`;
      errorSources = [
        {
          path: field || 'field',
          message: `${readableField} already exists in our system. Try logging in or use another value.`,
        },
      ];
    }

    // P2025 → Record not found
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested record was not found.';
      errorSources = [
        {
          path: '',
          message:
            'The item you are looking for does not exist or may have been deleted. Please verify and try again.',
        },
      ];
    }

    // P2003 → Foreign key constraint
    else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Related data not found.';
      errorSources = [
        {
          path: (err.meta?.field_name as string) || 'reference',
          message:
            'One of the referenced items (like a Post or User) does not exist. Please ensure all IDs are valid.',
        },
      ];
    }

    // P2014 → Relation violation
    else if (err.code === 'P2014') {
      statusCode = 400;
      message = 'This action would break a required link between records.';
      errorSources = [{ path: '', message: 'A required relation between data records was violated.' }];
    }

    // Generic known Prisma error
    else {
      message = 'A database error occurred. Please try again.';
      errorSources = [{ path: '', message: `Database error (code: ${err.code}). Please contact support if this persists.` }];
    }
  }

  // ── 3. Prisma Validation Error ───────────────────────────────
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data was sent to the database.';
    const detail = err.message.split('\n').filter(Boolean).pop() || '';
    errorSources = [
      {
        path: '',
        message: detail
          ? `Data format issue: ${detail}`
          : 'The data you provided does not match the expected format. Please review your input.',
      },
    ];
  }

  // ── 4. JWT Token Expired ─────────────────────────────────────
  else if (err?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again to continue.';
    errorSources = [
      {
        path: 'authorization',
        message: 'Your access token is no longer valid. Log in again to get a new token.',
      },
    ];
  }

  // ── 5. JWT Invalid Token ─────────────────────────────────────
  else if (err?.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed. Your token is invalid or has been tampered with.';
    errorSources = [
      {
        path: 'authorization',
        message: 'The provided token is not valid. Please log in again to get a fresh token.',
      },
    ];
  }

  // ── 6. JWT Not Before Error ──────────────────────────────────
  else if (err?.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Your token is not active yet. Please wait a moment and try again.';
    errorSources = [{ path: 'authorization', message: 'Token not yet valid.' }];
  }

  // ── 7. Custom AppError ───────────────────────────────────────
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  }

  // ── 8. Generic JS/Node Error ─────────────────────────────────
  else if (err instanceof Error) {
    // Don't expose raw internal error messages in production
    if (process.env.NODE_ENV === 'production') {
      message = 'An unexpected error occurred. Our team has been notified.';
      errorSources = [{ path: '', message: 'Internal server error.' }];
    } else {
      message = err.message;
      errorSources = [{ path: '', message: err.message }];
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(process.env.NODE_ENV === 'development' && { stack: err?.stack }),
  });
};

export default globalErrorHandler;
