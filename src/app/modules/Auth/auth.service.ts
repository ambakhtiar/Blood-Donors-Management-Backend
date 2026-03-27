import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { Secret } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { 
  IChangePassword, 
  IForgotPassword, 
  ILocationInfo, 
  ILoginUser, 
  IRegisterUser, 
  IResetPassword 
} from './auth.interface';
import { prisma } from '../../lib/prisma';
import { AccountStatus, UserRole } from '../../../generated/prisma';
import { sendEmail } from '../../utils/sendEmail';
import crypto from 'crypto';


const registerUser = async (payload: IRegisterUser) => {
  const { password, role, donorInfo, hospitalInfo, organisationInfo, ...userData } = payload;

  // Check if user exists
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

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

  let accountStatus: AccountStatus = AccountStatus.ACTIVE;
  let locationData: Partial<ILocationInfo> = {};

  // Extract location and set status efficiently
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
    // 1. Create User
    const user = await tx.user.create({ data: newUserData });

    // 2. Dynamically create nested profile depending on role
    if (role === 'USER' && donorInfo) {
      const { division, district, upazila, ...restDonorInfo } = donorInfo;
      if (restDonorInfo.lastDonationDate) {
        restDonorInfo.lastDonationDate = new Date(restDonorInfo.lastDonationDate);
      }
      await tx.donorProfile.create({
        data: { ...restDonorInfo, userId: user.id },
      });
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

  const { password: _, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const loginUser = async (payload: ILoginUser, ipAddress: string, device: string) => {
  const { contactNumber, email, password } = payload;

  // Find user by either contactNumber OR email
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

  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, `Your account is ${user.accountStatus.toLowerCase()}`);
  }
  if (user.accountStatus === 'PENDING') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account is pending approval.');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password as string);
  if (!isPasswordMatched) throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password!');

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      email: user.email,
      contactNumber: user.contactNumber,
      ipAddress,
      device,
      refreshToken: '', // Temporary empty string, will update after generating JWT
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const accessToken = createToken(
    { userId: user.id, role: user.role }, 
    config.jwt.secret as string, 
    config.jwt.expires_in as string
  );
  
  const refreshToken = createToken(
    { userId: user.id, role: user.role, sessionId: session.id }, 
    config.jwt.refresh_secret as string, 
    config.jwt.refresh_expires_in as string
  );
  
  const hashedRefreshToken = await bcrypt.hash(refreshToken, Number(config.bcrypt_salt_rounds));
  
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken: hashedRefreshToken }
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  // verify token
  let decodedData;
  try {
    decodedData = verifyToken(token, config.jwt.refresh_secret as string) as jwt.JwtPayload;
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const { userId, sessionId } = decodedData;

  // checking if the session exists and is valid
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || !session.isValid || new Date() > session.expiresAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Session is invalid or expired!');
  }

  // Compare the cookie refresh token with the hashed refresh token in the DB
  const isRefreshTokenMatched = await bcrypt.compare(token, session.refreshToken);
  if (!isRefreshTokenMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token!');
  }

  // checking if the user exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already blocked
  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.secret as string,
    config.jwt.expires_in as string,
  );

  return {
    accessToken,
  };
};

const changePassword = async (userData: jwt.JwtPayload, payload: IChangePassword) => {
  // checking if the user is already exist
  const user = await prisma.user.findUnique({
    where: {
      id: userData.userId,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already blocked
  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // checking if password is correct
  if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: {
      id: userData.userId,
    },
    data: {
      password: newHashedPassword,
    },
  });

  return null;
};

const forgotPassword = async (payload: IForgotPassword) => {
  // checking if the user is already exist
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

  // checking if the user is already blocked
  if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedToken = await bcrypt.hash(otp, Number(config.bcrypt_salt_rounds));
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes buffer for template's 2 mins

  await (prisma as any).verificationToken.upsert({
    where: { email: user.email as string },
    update: { token: hashedToken, expiresAt, isUsed: false },
    create: { email: user.email as string, token: hashedToken, expiresAt },
  });

  // Determine user name for template
  const userName = 
    user.admin?.name || 
    user.superAdmin?.name || 
    user.hospital?.name || 
    user.organisation?.name || 
    user.donorProfile?.name || 
    'User';

  await sendEmail({
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
  // checking if the user is already exist
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already blocked
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

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
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