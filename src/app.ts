import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

export default app;