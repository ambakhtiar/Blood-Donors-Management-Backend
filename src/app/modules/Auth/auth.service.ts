import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import config from '../../config';
import { createToken } from '../../utils/jwt.utils';
import { ILocationInfo, ILoginUser, IRegisterUser } from './auth.interface';
import { prisma } from '../../lib/prisma';
import { AccountStatus, UserRole } from '../../../generated/prisma';


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

  const accessToken = createToken(jwtPayload, config.jwt.secret as string, config.jwt.expires_in as string);
  const refreshToken = createToken(jwtPayload, config.jwt.refresh_secret as string, config.jwt.refresh_expires_in as string);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, Number(config.bcrypt_salt_rounds));

  // Create session in a single database call
  await prisma.session.create({
    data: {
      userId: user.id,
      email: user.email,
      contactNumber: user.contactNumber,
      ipAddress,
      device,
      refreshToken: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
};