import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentServices } from './payment.service';
import config from '../../config';
import { PaymentStatus } from '../../../generated/prisma';

const initiateDonation = catchAsync(async (req: Request, res: Response) => {
  const { postId, amount } = req.body;
  const result = await PaymentServices.initiateDonation(req.user.userId, postId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.query;
  await PaymentServices.paymentSuccess(transactionId as string);

  // Redirect to frontend success page
  res.redirect(`${config.client_url}/donation-success?transactionId=${transactionId}`);
});

const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.query;
  await PaymentServices.paymentStatusUpdate(transactionId as string, PaymentStatus.FAILED);

  // Redirect to frontend fail page
  res.redirect(`${config.client_url}/donation-fail?transactionId=${transactionId}`);
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.query;
  await PaymentServices.paymentStatusUpdate(transactionId as string, PaymentStatus.CANCELLED);

  // Redirect to frontend cancel page
  res.redirect(`${config.client_url}/donation-cancel?transactionId=${transactionId}`);
});

const paymentIPN = catchAsync(async (req: Request, res: Response) => {
  // IPN (Instant Payment Notification) callback logic if needed
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'IPN received',
    data: null,
  });
});

export const PaymentControllers = {
  initiateDonation,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN
};
