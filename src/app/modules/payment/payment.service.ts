import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { PostType, PaymentStatus } from "../../../generated/prisma";
import { SSLCommerzUtils } from "../../../utils/sslcommerz";
import { envVars } from "../../config/env";

const initiateDonation = async (userId: string, postId: string, amount: number) => {
  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
    include: { author: true }
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (post.type !== PostType.HELPING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only helping posts support crowdfunding");
  }

  if (!post.isApproved) {
    throw new AppError(httpStatus.FORBIDDEN, "Post is not yet approved by an administrator");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create PENDING payment
  await prisma.payment.create({
    data: {
      amount,
      transactionId,
      postId,
      userId,
      status: PaymentStatus.PENDING
    }
  });

  const paymentInitData = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: transactionId,
    success_url: `${envVars.BACKEND_URL}/api/v1/payments/success?transactionId=${transactionId}`,
    fail_url: `${envVars.BACKEND_URL}/api/v1/payments/fail?transactionId=${transactionId}`,
    cancel_url: `${envVars.BACKEND_URL}/api/v1/payments/cancel?transactionId=${transactionId}`,
    ipn_url: `${envVars.BACKEND_URL}/api/v1/payments/ipn`,
    shipping_method: 'N/A',
    product_name: 'Donation',
    product_category: 'Crowdfunding',
    product_profile: 'general',
    cus_name: user.email || 'Donor', // Use email if name not available in User
    cus_email: user.email || 'donor@example.com',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: user.contactNumber || '01700000000',
  };

  const response = await SSLCommerzUtils.initPayment(paymentInitData);
  return response.GatewayPageURL;
};

const paymentSuccess = async (transactionId: string) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { transactionId }
    });

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { message: "Already successful" };
    }

    // Update payment status
    await tx.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.SUCCESS }
    });

    // Increment raisedAmount in Post
    await tx.post.update({
      where: { id: payment.postId },
      data: {
        raisedAmount: {
          increment: payment.amount
        }
      }
    });

    return { message: "Payment successful" };
  });
};

const paymentStatusUpdate = async (transactionId: string, status: PaymentStatus) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId }
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  await prisma.payment.update({
    where: { transactionId },
    data: { status }
  });

  return { message: `Payment ${status.toLowerCase()}` };
};

export const PaymentServices = {
  initiateDonation,
  paymentSuccess,
  paymentStatusUpdate
};
