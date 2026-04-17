import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentServices } from './payment.service';
import { envVars } from '../../config/env';
import { PaymentStatus } from '../../../generated/prisma';

const initiateDonation = catchAsync(async (req: Request, res: Response) => {
  const { postId, amount, success_url, fail_url, cancel_url } = req.body;
  const result = await PaymentServices.initiateDonation(req.user.userId, postId, amount, {
    success_url,
    fail_url,
    cancel_url,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: { paymentUrl: result },
  });
});

const paymentSuccess = async (req: Request, res: Response) => {
  const transactionId = (req.query.transactionId || req.body.tran_id) as string;
  try {
    const result = await PaymentServices.paymentSuccess(transactionId);
    const postIdStr = result?.postId ? `&postId=${result.postId}` : '';
    
    // Redirect to frontend success page
    res.redirect(`${envVars.CLIENT_URL}/payment/success?transactionId=${transactionId}${postIdStr}`);
  } catch (error: any) {
    console.error('Payment Success Handler Error:', error);
    
    // Attempt to get postId even on error to help redirection if possible
    const payment = await prisma.payment.findUnique({ where: { transactionId } }).catch(() => null);
    const postIdStr = payment?.postId ? `&postId=${payment.postId}` : '';
    
    const errorMessage = encodeURIComponent(error?.message || 'Database update failed after success');
    res.redirect(`${envVars.CLIENT_URL}/payment/fail?transactionId=${transactionId}${postIdStr}&error=${errorMessage}`);
  }
};

const paymentFail = async (req: Request, res: Response) => {
  const transactionId = (req.query.transactionId || req.body.tran_id) as string;
  try {
    await PaymentServices.paymentStatusUpdate(transactionId, PaymentStatus.FAILED);
    res.redirect(`${envVars.CLIENT_URL}/payment/fail?transactionId=${transactionId}`);
  } catch (error) {
    res.redirect(`${envVars.CLIENT_URL}/payment/fail?transactionId=${transactionId}&error=StatusUpdateFailed`);
  }
};

const paymentCancel = async (req: Request, res: Response) => {
  const transactionId = (req.query.transactionId || req.body.tran_id) as string;
  try {
    await PaymentServices.paymentStatusUpdate(transactionId, PaymentStatus.CANCELLED);
    res.redirect(`${envVars.CLIENT_URL}/payment/cancel?transactionId=${transactionId}`);
  } catch (error) {
    res.redirect(`${envVars.CLIENT_URL}/payment/fail?transactionId=${transactionId}&error=CancelUpdateFailed`);
  }
};

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
