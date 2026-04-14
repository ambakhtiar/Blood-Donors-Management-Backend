import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { AccountStatus, UserRole } from '../../../generated/prisma';
import { envVars } from '../../config/env';

const createAdmin = async (payload: any) => {
  const { name, email, contactNumber, password } = payload;
  const adminPassword = password || envVars.JWT.SECRET; // fallback password if not provided

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { contactNumber },
      ],
    },
  });

  if (userExists) {
    throw new AppError(httpStatus.CONFLICT, 'An account with this email address or contact number already exists. Please use different credentials.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, Number(envVars.BCRYPT_SALT_ROUNDS));

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        contactNumber,
        password: hashedPassword,
        role: UserRole.ADMIN,
        accountStatus: AccountStatus.ACTIVE,
        needsPasswordChange: true,
        division: payload.division || 'Central',
        district: payload.district || 'Central',
        upazila: payload.upazila || 'Central',
      },
    });

    const admin = await tx.admin.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return { user, admin };
  });

  const { password: _password, ...userWithoutPassword } = result.user;
  return { ...userWithoutPassword, admin: result.admin };
};

const getAllAdmins = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit } = query;
  
  const pageNumber = Number(page || 1);
  const limitNumber = Number(limit || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const andConditions: any[] = [{ isDeleted: false }];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm as string, mode: 'insensitive' } },
        { user: { email: { contains: searchTerm as string, mode: 'insensitive' } } },
        { user: { contactNumber: { contains: searchTerm as string, mode: 'insensitive' } } },
      ],
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const admins = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limitNumber,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          contactNumber: true,
          role: true,
          accountStatus: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const total = await prisma.admin.count({ where: whereConditions });

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: admins,
  };
};

const getSingleAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          contactNumber: true,
          role: true,
          accountStatus: true,
          isDeleted: true,
        },
      },
    },
  });

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin account not found. The ID may be incorrect or the account has been deleted.');
  }

  return admin;
};

const updateAdmin = async (id: string, payload: any) => {
  const { name, contactNumber } = payload;
  
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
    include: { user: true },
  });

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin account not found. The ID may be incorrect or the account has been deleted.');
  }

  const result = await prisma.$transaction(async (tx) => {
    if (name) {
      await tx.admin.update({
        where: { id },
        data: { name },
      });
    }

    if (contactNumber) {
      // Check if new contact number exists
      if (contactNumber !== admin.user.contactNumber) {
        const existing = await tx.user.findUnique({ where: { contactNumber } });
        if (existing) {
          throw new AppError(httpStatus.CONFLICT, 'This contact number is already registered to another account. Please use a different contact number.');
        }
      }

      await tx.user.update({
        where: { id: admin.userId },
        data: { contactNumber },
      });
    }

    return tx.admin.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, contactNumber: true, role: true, accountStatus: true },
        },
      },
    });
  });

  return result;
};

const changeAdminAccess = async (id: string, payload: { accountStatus: AccountStatus }) => {
  const { accountStatus } = payload;

  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
    include: { user: true },
  });

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin account not found. The ID may be incorrect or the account has been deleted.');
  }

  await prisma.user.update({
    where: { id: admin.userId },
    data: { accountStatus },
  });

  return null;
};

const deleteAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin account not found. The ID may be incorrect or the account has been deleted.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: { isDeleted: true },
    });

    await tx.user.update({
      where: { id: admin.userId },
      data: { isDeleted: true },
    });
  });

  return null;
};

export const ManageAdminServices = {
  createAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  changeAdminAccess,
  deleteAdmin,
};
