import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { IUpdateProfilePayload } from "./user.interface";
import { Prisma, UserRole } from "../../../generated/prisma";

const getMyProfile = async (userId: string, role: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: false,
    },
    include: {
      donorProfile: role === UserRole.USER,
      hospital: role === UserRole.HOSPITAL,
      organisation: role === UserRole.ORGANISATION,
      admin: role === UserRole.ADMIN,
      superAdmin: role === UserRole.SUPER_ADMIN,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
  }

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const updateMyProfile = async (userId: string, role: string, payload: IUpdateProfilePayload) => {
  const { donorInfo, hospitalInfo, organisationInfo, ...userData } = payload;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Core User table
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: userData,
    });

    // 2. Dynamically update nested profile based on role
    if (role === UserRole.USER && donorInfo) {
      await tx.donorProfile.update({
        where: { userId },
        data: donorInfo,
      });
    } else if (role === UserRole.HOSPITAL && hospitalInfo) {
      await tx.hospital.update({
        where: { userId },
        data: hospitalInfo,
      });
    } else if (role === UserRole.ORGANISATION && organisationInfo) {
       await tx.organisation.update({
        where: { userId },
        data: organisationInfo,
      });
    }

    return updatedUser;
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const getDonorList = async (filters: Record<string, string | undefined>) => {
    const { bloodGroup, division, district, upazila, searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { contactNumber: { contains: searchTerm, mode: 'insensitive' } },
                { donorProfile: { name: { contains: searchTerm, mode: 'insensitive' } } }
            ]
        });
    }

    if (bloodGroup) {
        andConditions.push({
            donorProfile: { bloodGroup: { equals: bloodGroup } }
        });
    }

    if (division) {
        andConditions.push({ division: { equals: division } });
    }

    if (district) {
        andConditions.push({ district: { equals: district } });
    }

    if (upazila) {
        andConditions.push({ upazila: { equals: upazila } });
    }

    // Always filter for USER role and not deleted
    andConditions.push({
        role: UserRole.USER,
        isDeleted: false,
        donorProfile: {
            isAvailableForDonation: true,
            isDeleted: false
        }
    });

    const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

    const result = await prisma.user.findMany({
        where: whereConditions,
        include: {
            donorProfile: true
        }
    });

    return result.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
};

export const UserServices = {
  getMyProfile,
  updateMyProfile,
  getDonorList,
};