import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Parsers
// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  process.env.BACKEND_URL,
  process.env.FRINTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.) or 'null' origin (common in redirects)
      if (!origin || origin === 'null') return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);
app.use(express.json());
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