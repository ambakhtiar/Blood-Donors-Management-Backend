> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\modules\payment\payment.service.ts` (Domain: **Database (Models/Schema)**)

### 🔴 Database (Models/Schema) Gotchas
- **⚠️ GOTCHA: Fixed null crash in AppError — externalizes configuration for environment fle...**: -         
+         'BACKEND_URL',
-     ]
+         'FRINTEND_URL',
- 
+     ]
-     requireEnvVariable.forEach((variable) => {
+ 
-         if (!process.env[variable]) {
+     requireEnvVariable.forEach((variable) => {
-             throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
+         if (!process.env[variable]) {
-         }
+             throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
-     })
+         }
- 
+     })
-     return {
+ 
-         NODE_ENV: process.env.NODE_ENV as string,
+     return {
-         PORT: Number(process.env.PORT) || 5000,
+         NODE_ENV: process.env.NODE_ENV as string,
-         DATABASE_URL: process.env.DATABASE_URL as string,
+         PORT: Number(process.env.PORT) || 5000,
-         EMAIL_SENDER: {
+         DATABASE_URL: process.env.DATABASE_URL as string,
-             SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
+         EMAIL_SENDER: {
-             SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
+             SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
-             SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
+             SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
-             SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
+             SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
-             SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
+             SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
-         },
+             SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
-         SSL_COMMERZ: {
+         },
-             STORE_ID: process.env.SSL_COMMERZ_STORE_ID as string,
+         SSL_COMMERZ: {
-             STORE_[REDACTED] as string,
+             STORE
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]
- **⚠️ GOTCHA: Fixed null crash in AppError — externalizes configuration for environment fle...**: -     ]
+         
- 
+     ]
-     requireEnvVariable.forEach((variable) => {
+ 
-         if (!process.env[variable]) {
+     requireEnvVariable.forEach((variable) => {
-             throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
+         if (!process.env[variable]) {
-         }
+             throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
-     })
+         }
- 
+     })
-     return {
+ 
-         NODE_ENV: process.env.NODE_ENV as string,
+     return {
-         PORT: Number(process.env.PORT) || 5000,
+         NODE_ENV: process.env.NODE_ENV as string,
-         DATABASE_URL: process.env.DATABASE_URL as string,
+         PORT: Number(process.env.PORT) || 5000,
-         EMAIL_SENDER: {
+         DATABASE_URL: process.env.DATABASE_URL as string,
-             SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
+         EMAIL_SENDER: {
-             SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
+             SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
-             SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
+             SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
-             SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
+             SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
-             SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
+             SMTP_PORT: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
-         },
+             SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
-         SSL_COMMERZ: {
+         },
-             STORE_ID: process.env.SSL_COMMERZ_STORE_ID as string,
+         SSL_COMMERZ: {
-             STORE_[REDACTED] as string,
+             STORE_ID: process.env.SSL_COMMERZ_STORE_ID as string,
-  
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]

### 📐 Database (Models/Schema) Conventions & Fixes
- **[problem-fix] Fixed null crash in AppError — ensures atomic multi-step database operations**: - // import { v4 as uuidv4 } from 'uuid'; // Removed as it was unused and uninstalled
+ 
- 
+ const initiateDonation = async (userId: string, postId: string, amount: number) => {
- const initiateDonation = async (userId: string, postId: string, amount: number) => {
+   const post = await prisma.post.findUnique({
-   const post = await prisma.post.findUnique({
+     where: { id: postId, isDeleted: false },
-     where: { id: postId, isDeleted: false },
+     include: { author: true }
-     include: { author: true }
+   });
-   });
+ 
- 
+   if (!post) {
-   if (!post) {
+     throw new AppError(httpStatus.NOT_FOUND, "Post not found");
-     throw new AppError(httpStatus.NOT_FOUND, "Post not found");
+   }
-   }
+ 
- 
+   if (post.type !== PostType.HELPING) {
-   if (post.type !== PostType.HELPING) {
+     throw new AppError(httpStatus.BAD_REQUEST, "Only helping posts support crowdfunding");
-     throw new AppError(httpStatus.BAD_REQUEST, "Only helping posts support crowdfunding");
+   }
-   }
+ 
- 
+   if (!post.isApproved) {
-   if (!post.isApproved) {
+     throw new AppError(httpStatus.FORBIDDEN, "Post is not yet approved by an administrator");
-     throw new AppError(httpStatus.FORBIDDEN, "Post is not yet approved by an administrator");
+   }
-   }
+ 
- 
+   const user = await prisma.user.findUnique({
-   const user = await prisma.user.findUnique({
+     where: { id: userId }
-     where: { id: userId }
+   });
-   });
+ 
- 
+   if (!user) {
-   if (!user) {
+     throw new AppError(httpStatus.NOT_FOUND, "User not found");
-     throw new AppError(httpStatus.NOT_FOUND, "User not found");
+   }
-   }
+ 
- 
+   const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
-   const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
+ 
- 
+   // Create PENDING payment
-   // Create PENDING payment
+   await prisma.payment.create({
-   await prisma.payment.create({
+     data: {
-     data: {
+       amount,
-       amount,
+ 
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [initiateDonation, paymentSuccess, paymentStatusUpdate, PaymentServices]
- **[what-changed] Replaced uuid with uuid**: - import { v4 as uuidv4 } from 'uuid'; // I'll use a transaction ID generator
+ // import { v4 as uuidv4 } from 'uuid'; // Removed as it was unused and uninstalled

📌 IDE AST Context: Modified symbols likely include [initiateDonation, paymentSuccess, paymentStatusUpdate, PaymentServices]
- **[what-changed] 🟢 Edited src/app/modules/payment/payment.controller.ts (5 changes, 2min)**: Active editing session on src/app/modules/payment/payment.controller.ts.
5 content changes over 2 minutes.
- **[problem-fix] problem-fix in payment.controller.ts**: -    // IPN (Instant Payment Notification) callback logic if needed
+   // IPN (Instant Payment Notification) callback logic if needed

📌 IDE AST Context: Modified symbols likely include [initiateDonation, paymentSuccess, paymentFail, paymentCancel, paymentIPN]
- **[what-changed] Updated schema PaymentStatus — externalizes configuration for environment fle...**: - 
+ import { PaymentStatus } from '../../../generated/prisma';
- const initiateDonation = catchAsync(async (req: Request, res: Response) => {
+ 
-   const { postId, amount } = req.body;
+ const initiateDonation = catchAsync(async (req: Request, res: Response) => {
-   const result = await PaymentServices.initiateDonation(req.user.userId, postId, amount);
+   const { postId, amount } = req.body;
- 
+   const result = await PaymentServices.initiateDonation(req.user.userId, postId, amount);
-   sendResponse(res, {
+ 
-     statusCode: httpStatus.OK,
+   sendResponse(res, {
-     success: true,
+     statusCode: httpStatus.OK,
-     message: 'Payment initiated successfully',
+     success: true,
-     data: result,
+     message: 'Payment initiated successfully',
-   });
+     data: result,
- });
+   });
- 
+ });
- const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
+ 
-   const { transactionId } = req.query;
+ const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
-   await PaymentServices.paymentSuccess(transactionId as string);
+   const { transactionId } = req.query;
- 
+   await PaymentServices.paymentSuccess(transactionId as string);
-   // Redirect to frontend success page
+ 
-   res.redirect(`${config.client_url}/donation-success?transactionId=${transactionId}`);
+   // Redirect to frontend success page
- });
+   res.redirect(`${config.client_url}/donation-success?transactionId=${transactionId}`);
- 
+ });
- const paymentFail = catchAsync(async (req: Request, res: Response) => {
+ 
-   const { transactionId } = req.query;
+ const paymentFail = catchAsync(async (req: Request, res: Response) => {
-   await PaymentServices.paymentStatusUpdate(transactionId as string, PaymentStatus.FAILED);
+   const { transactionId } = req.query;
- 
+   await PaymentServices.paymentStatusUpdate(transactionId as string, PaymentStatus.FAILED);
-   // Redirect to frontend fail page
+ 
-   res.redirect(`${config.client_url}/donation-fail?tran
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [initiateDonation, paymentSuccess, paymentFail, paymentCancel, paymentIPN]
- **[what-changed] Updated schema Request — externalizes configuration for environment flexibility**: - import { PaymentStatus } from '../../../generated/prisma';
+ 
- 
+ const initiateDonation = catchAsync(async (req: Request, res: Response) => {
- const initiateDonation = catchAsync(async (req: Request, res: Response) => {
+   const { postId, amount } = req.body;
-   const { postId, amount } = req.body;
+   const result = await PaymentServices.initiateDonation(req.user.userId, postId, amount);
-   const result = await PaymentServices.initiateDonation(req.user.userId, postId, amount);
+ 
- 
+   sendResponse(res, {
-   sendResponse(res, {
+     statusCode: httpStatus.OK,
-     statusCode: httpStatus.OK,
+     success: true,
-     success: true,
+     message: 'Payment initiated successfully',
-     message: 'Payment initiated successfully',
+     data: result,
-     data: result,
+   });
-   });
+ });
- });
+ 
- 
+ const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
- const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
+   const { transactionId } = req.query;
-   const { transactionId } = req.query;
+   await PaymentServices.paymentSuccess(transactionId as string);
-   await PaymentServices.paymentSuccess(transactionId as string);
+ 
- 
+   // Redirect to frontend success page
-   // Redirect to frontend success page
+   res.redirect(`${config.client_url}/donation-success?transactionId=${transactionId}`);
-   res.redirect(`${config.client_url}/donation-success?transactionId=${transactionId}`);
+ });
- });
+ 
- 
+ const paymentFail = catchAsync(async (req: Request, res: Response) => {
- const paymentFail = catchAsync(async (req: Request, res: Response) => {
+   const { transactionId } = req.query;
-   const { transactionId } = req.query;
+   await PaymentServices.paymentStatusUpdate(transactionId as string, PaymentStatus.FAILED);
-   await PaymentServices.paymentStatusUpdate(transactionId as string, PaymentStatus.FAILED);
+ 
- 
+   // Redirect to frontend fail page
-   // Redirect to frontend fail page
+   res.redirect(`$
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [initiateDonation, paymentSuccess, paymentFail, paymentCancel, paymentIPN]
- **[what-changed] 🟢 Edited src/app/config/env.ts (9 changes, 1min)**: Active editing session on src/app/config/env.ts.
9 content changes over 1 minutes.
- **[what-changed] Updated configuration BACKEND_URL — externalizes configuration for environmen...**: -         }
+         },
-     }
+         BACKEND_URL: process.env.BACKEND_URL as string,
- }
+         FRINTEND_URL: process.env.FRINTEND_URL as string,
- 
+     }
- export const envVars = loadEnvVariables();
+ }
+ 
+ export const envVars = loadEnvVariables();

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]
- **[problem-fix] Fixed null crash in EnvConfig — externalizes configuration for environment fl...**: -     
+     BACKEND_URL: string;
-     DATABASE_URL: string;
+     FRINTEND_URL: string;
-     EMAIL_SENDER: {
+     DATABASE_URL: string;
-         SMTP_USER: string;
+     EMAIL_SENDER: {
-         SMTP_PASS: string;
+         SMTP_USER: string;
-         SMTP_HOST: string;
+         SMTP_PASS: string;
-         SMTP_PORT: number;
+         SMTP_HOST: string;
-         SMTP_FROM: string;
+         SMTP_PORT: number;
-     },
+         SMTP_FROM: string;
-     SSL_COMMERZ: {
+     },
-         STORE_ID: string;
+     SSL_COMMERZ: {
-         STORE_[REDACTED]
+         STORE_ID: string;
-         IS_LIVE: boolean;
+         STORE_[REDACTED]
-     }
+         IS_LIVE: boolean;
- }
+     }
- 
+ }
- const loadEnvVariables = (): EnvConfig => {
+ 
- 
+ const loadEnvVariables = (): EnvConfig => {
-     const requireEnvVariable = [
+ 
-         'NODE_ENV',
+     const requireEnvVariable = [
-         'PORT',
+         'NODE_ENV',
-         'DATABASE_URL',
+         'PORT',
-         'EMAIL_SENDER_SMTP_USER',
+         'DATABASE_URL',
-         'EMAIL_SENDER_SMTP_PASS',
+         'EMAIL_SENDER_SMTP_USER',
-         'EMAIL_SENDER_SMTP_HOST',
+         'EMAIL_SENDER_SMTP_PASS',
-         'EMAIL_SENDER_SMTP_PORT',
+         'EMAIL_SENDER_SMTP_HOST',
-         'EMAIL_SENDER_SMTP_FROM',
+         'EMAIL_SENDER_SMTP_PORT',
-         'SSL_COMMERZ_STORE_ID',
+         'EMAIL_SENDER_SMTP_FROM',
-         'SSL_COMMERZ_STORE_PASSWORD',
+         'SSL_COMMERZ_STORE_ID',
-         'SSL_COMMERZ_IS_LIVE',
+         'SSL_COMMERZ_STORE_PASSWORD',
-     ]
+         'SSL_COMMERZ_IS_LIVE',
- 
+     ]
-     requireEnvVariable.forEach((variable) => {
+ 
-         if (!process.env[variable]) {
+     requireEnvVariable.forEach((variable) => {
-             throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
+         if (!process.env[variable])
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]
- **[what-changed] what-changed in env.ts**: - 
+     

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]
- **[what-changed] what-changed in env.ts**: -     PORT: number;,
+     PORT: number;
-     
+ 

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]
- **[problem-fix] Fixed null crash in PORT — externalizes configuration for environment flexibi...**: -     PORT: number;
+     PORT: number;,
-     DATABASE_URL: string;
+     
-     EMAIL_SENDER: {
+     DATABASE_URL: string;
-         SMTP_USER: string;
+     EMAIL_SENDER: {
-         SMTP_PASS: string;
+         SMTP_USER: string;
-         SMTP_HOST: string;
+         SMTP_PASS: string;
-         SMTP_PORT: number;
+         SMTP_HOST: string;
-         SMTP_FROM: string;
+         SMTP_PORT: number;
-     },
+         SMTP_FROM: string;
-     SSL_COMMERZ: {
+     },
-         STORE_ID: string;
+     SSL_COMMERZ: {
-         STORE_[REDACTED]
+         STORE_ID: string;
-         IS_LIVE: boolean;
+         STORE_[REDACTED]
-     }
+         IS_LIVE: boolean;
- }
+     }
- 
+ }
- const loadEnvVariables = (): EnvConfig => {
+ 
- 
+ const loadEnvVariables = (): EnvConfig => {
-     const requireEnvVariable = [
+ 
-         'NODE_ENV',
+     const requireEnvVariable = [
-         'PORT',
+         'NODE_ENV',
-         'DATABASE_URL',
+         'PORT',
-         'EMAIL_SENDER_SMTP_USER',
+         'DATABASE_URL',
-         'EMAIL_SENDER_SMTP_PASS',
+         'EMAIL_SENDER_SMTP_USER',
-         'EMAIL_SENDER_SMTP_HOST',
+         'EMAIL_SENDER_SMTP_PASS',
-         'EMAIL_SENDER_SMTP_PORT',
+         'EMAIL_SENDER_SMTP_HOST',
-         'EMAIL_SENDER_SMTP_FROM',
+         'EMAIL_SENDER_SMTP_PORT',
-         'SSL_COMMERZ_STORE_ID',
+         'EMAIL_SENDER_SMTP_FROM',
-         'SSL_COMMERZ_STORE_PASSWORD',
+         'SSL_COMMERZ_STORE_ID',
-         'SSL_COMMERZ_IS_LIVE',
+         'SSL_COMMERZ_STORE_PASSWORD',
-     ]
+         'SSL_COMMERZ_IS_LIVE',
- 
+     ]
-     requireEnvVariable.forEach((variable) => {
+ 
-         if (!process.env[variable]) {
+     requireEnvVariable.forEach((variable) => {
-             throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
+         if (!process.env[variable]) {
-         
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [EnvConfig, loadEnvVariables, envVars]
- **[discovery] discovery in admin.service.ts**: File updated (external): src/app/modules/admin/admin.service.ts

Content summary (117 lines):
import { Prisma, AccountStatus } from "../../../generated/prisma";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { IOptions, IUserFilters } from "./admin.interface";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { sendNotificationEmail } from "../../utils/sendEmail";

const getAllUsers = async (filters: IUserFilters, options: IOptions) => {
  const { searchTerm, email, contactNu
