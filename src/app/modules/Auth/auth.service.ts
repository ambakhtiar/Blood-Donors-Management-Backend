import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { envVars } from '../../config/env';
import {
  IChangePassword,
  IForgotPassword,
  ILocationInfo,
  ILoginUser,
  IRegisterUser,
  IResetPassword
} from './auth.interface';
import { prisma } from '../../lib/prisma';
import { AccountStatus, Gender, UserRole } from '../../../generated/prisma';
import { sendOTPEmail } from '../../utils/sendEmail';
import { createToken, verifyToken } from '../../utils/jwt.utils';

const registerUser = async (payload: IRegisterUser) => {
  const { password, role, donorInfo, hospitalInfo, organisationInfo, ...userData } = payload;

  if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot register as an Admin or Super Admin");
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
    throw new AppError(httpStatus.CONFLICT, 'User with this email or contact already exists');
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
      const { ...restHospitalInfo } = hospitalInfo;
      await tx.hospital.create({
        data: { ...restHospitalInfo, userId: user.id },
      });
    } else if (role === 'ORGANISATION' && organisationInfo) {
      const { ...restOrgInfo } = organisationInfo;
      await tx.organisation.create({
        data: { ...restOrgInfo, userId: user.id },
      });
    }

    return user;
  });

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

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  if (user.isDeleted) throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');

  if (user.accountStatus === 'BLOCKED') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been blocked by the administration due to policy violations. Please contact support.',
    );
  }

  if (user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account request has been rejected.');
  }

  if (user.accountStatus === 'PENDING') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account is pending approval.');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password as string);
  if (!isPasswordMatched) throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password!');

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
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const { userId, sessionId } = decodedData;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || !session.isValid || new Date() > session.expiresAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Session is invalid or expired!');
  }

  const isRefreshTokenMatched = await bcrypt.compare(token, session.refreshToken);
  if (!isRefreshTokenMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token!');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
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
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
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
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
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
};

const resetPassword = async (payload: IResetPassword) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const verificationToken = await (prisma as any).verificationToken.findUnique({
    where: { email: user.email as string },
  });

  if (!verificationToken || verificationToken.isUsed || new Date() > verificationToken.expiresAt) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid or expired reset token!');
  }

  const isTokenMatched = await bcrypt.compare(payload.token, verificationToken.token);
  if (!isTokenMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid reset token!');
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