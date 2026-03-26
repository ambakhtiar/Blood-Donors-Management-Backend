import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send({
    success: true,
    message: 'Blood Donation & Crowdfunding API is running smoothly',
  });
});

// App routing
app.use('/api/v1', router);

// Global Error Handler
app.use(globalErrorHandler);

// Not Found Route
app.use(notFound);

export default app;