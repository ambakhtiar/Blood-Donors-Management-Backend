import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { envVars } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { AccountStatus, Gender, UserRole } from '../../../generated/prisma';
import { sendOTPEmail } from '../../utils/sendEmail';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { bloodGroupMap } from '../../helpers/bloodGroup';
import {
  IChangePassword,
  IForgotPassword,
  ILocationInfo,
  ILoginUser,
  IRegisterUser,
  IResetPassword,
} from './auth.interface';


const registerUser = async (payload: IRegisterUser) => {
  const { password, role, donorInfo, hospitalInfo, organisationInfo, ...userData } = payload;

  if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin and Super Admin accounts cannot be registered through this endpoint. Please contact the platform administrator.");
  }

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        { contactNumber: userData.contactNumber },
        ...(userData.email ? [{ email: userData.email }] : []),
      ],
    },
  });

  if (userExists) {
    throw new AppError(httpStatus.CONFLICT, 'An account with this email address or contact number already exists. Please log in or use a different contact detail.');
  }

  const hashedPassword = await bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUNDS));

  let accountStatus: AccountStatus = AccountStatus.ACTIVE;
  let locationData: Partial<ILocationInfo> = {};

  if (role === UserRole.HOSPITAL && hospitalInfo) {
    accountStatus = AccountStatus.PENDING;
    const { division, district, upazila } = hospitalInfo;
    locationData = { division, district, upazila };
  } else if (role === UserRole.ORGANISATION && organisationInfo) {
    accountStatus = AccountStatus.PENDING;
    const { division, district, upazila } = organisationInfo;
    locationData = { division, district, upazila };
  } else if (role === UserRole.USER && donorInfo) {
    const { division, district, upazila } = donorInfo;
    locationData = { division, district, upazila };
  }

  const newUserData = {
    ...userData,
    password: hashedPassword,
    role,
    accountStatus,
    ...locationData,
  };

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: newUserData });

    if (role === 'USER' && donorInfo) {
      const { division, district, upazila, ...restDonorInfo } = donorInfo;
      if (restDonorInfo.lastDonationDate) {
        restDonorInfo.lastDonationDate = new Date(restDonorInfo.lastDonationDate);
      }

      // Map bloodGroup string (e.g., 'O+') to Prisma Enum (e.g., 'O_POSITIVE')
      if (restDonorInfo.bloodGroup) {
        restDonorInfo.bloodGroup = (bloodGroupMap[restDonorInfo.bloodGroup] || restDonorInfo.bloodGroup) as any;
      }

      await tx.donorProfile.create({
        data: { ...restDonorInfo, userId: user.id },
      });

      const existingBloodDonor = await tx.bloodDonor.findUnique({
        where: { contactNumber: user.contactNumber },
      });

      if (existingBloodDonor) {
        await tx.bloodDonor.update({
          where: { id: existingBloodDonor.id },
          data: { userId: user.id },
        });
      } else {
        await tx.bloodDonor.create({
          data: {
            name: restDonorInfo.name,
            contactNumber: user.contactNumber,
            bloodGroup: restDonorInfo.bloodGroup,
            gender: restDonorInfo.gender as Gender,
            lastDonationDate: restDonorInfo.lastDonationDate,
            isAvailable: true,
            division: division as string,
            district: district as string,
            upazila: upazila as string,
            userId: user.id,
          },
        });
      }
    } else if (role === 'HOSPITAL' && hospitalInfo) {
      const { division, district, upazila, ...restHospitalInfo } = hospitalInfo;
      await tx.hospital.create({
        data: { ...restHospitalInfo, userId: user.id },
      });
    } else if (role === 'ORGANISATION' && organisationInfo) {
      const { division, district, upazila, ...restOrgInfo } = organisationInfo;
      await tx.organisation.create({
        data: { ...restOrgInfo, userId: user.id },
      });
    }

    return user;
  });

  // Notify Admins/Super Admins if a Hospital or Organisation registers
  if (role === UserRole.HOSPITAL || role === UserRole.ORGANISATION) {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        isDeleted: false,
      },
      select: { id: true, email: true },
    });

    const entityName = role === UserRole.HOSPITAL ? hospitalInfo?.name : organisationInfo?.name;
    const title = `New ${role} Registration Alert`;
    const message = `A new ${role.toLowerCase()} named "${entityName}" has registered and is pending approval. Please review and take action.`;

    // Import email utility within the scope to avoid circular dependencies if any
    const { sendNotificationEmail } = await import('../../utils/sendEmail');

    // Create In-App Notifications and Send Emails
    const notificationPromises = admins.map(async (admin) => {
      // In-App Notification
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title,
          message,
          type: "REGISTRATION_ALERT",
        },
      });

      // Email Notification
      if (admin.email) {
        await sendNotificationEmail(admin.email as string, title, message);
      }
    });

    await Promise.all(notificationPromises);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const loginUser = async (payload: ILoginUser, ipAddress: string, device: string) => {
  const { contactNumber, email, password } = payload;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(contactNumber ? [{ contactNumber }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'No account found with this email or contact number. Please check your credentials or sign up.');
  if (user.isDeleted) throw new AppError(httpStatus.FORBIDDEN, 'This account no longer exists. Please contact support if you believe this is a mistake.');

  if (user.accountStatus === 'BLOCKED') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been blocked by the administration due to policy violations. Please contact support.',
    );
  }

  if (user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account registration was rejected. Please contact our support team for more information.');
  }

  if (user.accountStatus === 'PENDING') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account is currently pending approval from an administrator. You will be notified once it is activated.');
  }

  if (!user.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This account does not have a password set. Please use the forgot password option to create one.');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) throw new AppError(httpStatus.UNAUTHORIZED, 'The password you entered is incorrect. Please try again or use "Forgot Password" to reset it.');

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      email: user.email,
      contactNumber: user.contactNumber,
      ipAddress,
      device,
      refreshToken: '',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = createToken(
    { userId: user.id, role: user.role },
    envVars.JWT.SECRET as string,
    envVars.JWT.EXPIRES_IN as string
  );

  const refreshToken = createToken(
    { userId: user.id, role: user.role, sessionId: session.id },
    envVars.JWT.REFRESH_SECRET as string,
    envVars.JWT.REFRESH_EXPIRES_IN as string
  );

  const hashedRefreshToken = await bcrypt.hash(refreshToken, Number(envVars.BCRYPT_SALT_ROUNDS));

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken: hashedRefreshToken }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, envVars.JWT.REFRESH_SECRET as string) as jwt.JwtPayload;
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Your session is invalid or has expired. Please log in again to continue.');
  }

  const { userId, sessionId } = decodedData;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || !session.isValid || new Date() > session.expiresAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Your session has expired. Please log in again to get a new access token.');
  }

  const isRefreshTokenMatched = await bcrypt.compare(token, session.refreshToken);
  if (!isRefreshTokenMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Your refresh token is invalid or has been tampered with. Please log in again.');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'The account associated with this session no longer exists. Please create a new account.');
  }

  if (user.accountStatus === 'BLOCKED') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been blocked by the administration due to policy violations. Please contact support.',
    );
  }

  if (user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This account is rejected.');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    envVars.JWT.SECRET as string,
    envVars.JWT.EXPIRES_IN as string,
  );

  return {
    accessToken,
  };
};

const changePassword = async (userData: jwt.JwtPayload, payload: IChangePassword) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userData.userId,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your account was not found. Please contact support.');
  }

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked or rejected. You cannot change your password. Please contact support.');
  }

  if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your current password is incorrect. Please enter the right password and try again.');
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUNDS),
  );

  await prisma.user.update({
    where: {
      id: userData.userId,
    },
    data: {
      password: newHashedPassword,
      needsPasswordChange: false,
    },
  });

  return null;
};

const forgotPassword = async (payload: IForgotPassword) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
      isDeleted: false,
    },
    include: {
      admin: true,
      superAdmin: true,
      hospital: true,
      organisation: true,
      donorProfile: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No account found with this email address. Please check the email and try again.');
  }

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked or rejected. Password reset is not available. Please contact our support team.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedToken = await bcrypt.hash(otp, Number(envVars.BCRYPT_SALT_ROUNDS));
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  await (prisma as any).verificationToken.upsert({
    where: { email: user.email as string },
    update: { token: hashedToken, expiresAt, isUsed: false },
    create: { email: user.email as string, token: hashedToken, expiresAt },
  });

  const userName =
    user.admin?.name ||
    user.superAdmin?.name ||
    user.hospital?.name ||
    user.organisation?.name ||
    user.donorProfile?.name ||
    'User';

  await sendOTPEmail({
    to: user.email as string,
    subject: 'Password Reset OTP',
    templateName: 'otp',
    templateData: {
      name: userName,
      otp: otp,
    },
  });

  return { id: user.id };
};

const resetPassword = async (payload: IResetPassword) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Account not found. The reset link may be invalid. Please try the forgot password process again.');
  }

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked or rejected. You cannot reset your password. Please contact support.');
  }

  const verificationToken = await (prisma as any).verificationToken.findUnique({
    where: { email: user.email as string },
  });

  if (!verificationToken || verificationToken.isUsed || new Date() > verificationToken.expiresAt) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your OTP has expired or has already been used. Please request a new OTP from the forgot password page.');
  }

  const isTokenMatched = await bcrypt.compare(payload.token, verificationToken.token);
  if (!isTokenMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'The OTP you entered is incorrect. Please double-check the code sent to your email and try again.');
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUNDS),
  );

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: payload.id },
      data: { password: newHashedPassword },
    });

    await (tx as any).verificationToken.update({
      where: { email: user.email as string },
      data: { isUsed: true },
    });
  });
};

export const AuthServices = {
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};