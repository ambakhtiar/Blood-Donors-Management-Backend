import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { PostType, PaymentStatus } from "../../../generated/prisma";
import { envVars } from "../../config/env";
import { SSLCommerzUtils } from "../../utils/sslcommerz";

const initiateDonation = async (
  userId: string, 
  postId: string, 
  amount: number,
  redirectUrls?: { success_url?: string; fail_url?: string; cancel_url?: string }
) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, isDeleted: false },
    include: { author: true }
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (post.type !== PostType.HELPING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only helping posts support crowdfunding");
  }

  // Prevent donation if goal is already met or if this donation exceeds it
  const currentRaised = post.raisedAmount || 0;
  const target = post.targetAmount || 0;
  
  if (currentRaised >= target) {
    throw new AppError(httpStatus.BAD_REQUEST, "This goal has already been successfully reached! Thank you for your interest.");
  }

  if (currentRaised + amount > target) {
    const remaining = target - currentRaised;
    throw new AppError(httpStatus.BAD_REQUEST, `This donation would exceed the target goal. Only ৳${remaining.toLocaleString()} more is needed.`);
  }

  if (!post.isVerified) {
    throw new AppError(httpStatus.FORBIDDEN, "Only verified helping posts can receive donations.");
  }

  if (!post.isApproved) {
    throw new AppError(httpStatus.FORBIDDEN, "Post is not yet approved by an administrator");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      admin: true,
      hospital: true,
      organisation: true,
    },
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

  const userName =
    user.donorProfile?.name ||
    user.admin?.name ||
    user.hospital?.name ||
    user.organisation?.name ||
    "Donor";

  // Use dynamic redirect URLs if provided, otherwise fallback to backend defaults
  const success_url = redirectUrls?.success_url || `${envVars.BACKEND_URL}/api/v1/payments/success?transactionId=${transactionId}`;
  const fail_url = redirectUrls?.fail_url || `${envVars.BACKEND_URL}/api/v1/payments/fail?transactionId=${transactionId}`;
  const cancel_url = redirectUrls?.cancel_url || `${envVars.BACKEND_URL}/api/v1/payments/cancel?transactionId=${transactionId}`;

  const paymentInitData = {
    total_amount: amount,
    currency: "BDT",
    tran_id: transactionId,
    success_url,
    fail_url,
    cancel_url,
    ipn_url: `${envVars.BACKEND_URL}/api/v1/payments/ipn`,
    shipping_method: "N/A",
    product_name: "Donation",
    product_category: "Crowdfunding",
    product_profile: "general",
    cus_name: userName,
    cus_email: user.email || "donor@example.com",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: user.contactNumber || "01700000000",
    ship_name: userName,
    ship_add1: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: "1000",
    ship_country: "Bangladesh",
  };

  const response = await SSLCommerzUtils.initPayment(paymentInitData);
  console.log('SSLCommerz Response:', response);
  if (response.status !== 'SUCCESS') {
    throw new AppError(httpStatus.BAD_REQUEST, response.failedreason || 'SSLCommerz payment initiation failed');
  }
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
      return { 
        message: "Already successful",
        postId: payment.postId
      };
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

    return { 
      message: "Payment successful",
      postId: payment.postId 
    };
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
