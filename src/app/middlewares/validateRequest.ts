import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });

    req.body = (result as any).body;
    req.cookies = (result as any).cookies;

    next();
  });
};

export default validateRequest;
