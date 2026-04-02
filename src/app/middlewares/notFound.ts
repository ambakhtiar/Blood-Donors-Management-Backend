import { Request, Response } from 'express';
import httpStatus from 'http-status';

const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `The endpoint "${req.method} ${req.originalUrl}" does not exist.`,
    errorSources: [
      {
        path: req.originalUrl,
        message: `No route found for "${req.method} ${req.originalUrl}". Please check the API documentation for the correct endpoint.`,
      },
    ],
  });
};

export default notFound;
