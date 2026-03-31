import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { IUpdateProfilePayload } from "./user.interface";
import { Prisma, UserRole, BloodGroup } from "../../../generated/prisma";
import { bloodGroupMap } from "../../helpers/bloodGroup";
import { JwtPayload } from "jsonwebtoken";
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const updateMyProfile = async (userId: string, role: string, payload: IUpdateProfilePayload) => {
  const { donorInfo, hospitalInfo, organisationInfo, ...userData } = payload;


  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Core User table (includes shared location fields: division, district, upazila)
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: userData,
    });

    // 2. Dynamically update nested profile based on role
    if (role === UserRole.USER && donorInfo) {
      // Map blood group and date
      const donorData = {
        ...donorInfo,
        bloodGroup: donorInfo.bloodGroup ? (bloodGroupMap[donorInfo.bloodGroup as keyof typeof bloodGroupMap] || (donorInfo.bloodGroup as BloodGroup)) : undefined,
        lastDonationDate: donorInfo.lastDonationDate ? new Date(donorInfo.lastDonationDate) : undefined,
      };

      await tx.donorProfile.update({
        where: { userId },
        data: donorData,
      });

      // Synchronize BloodDonor if it exists
      const bloodDonor = await tx.bloodDonor.findUnique({ where: { userId } });
      if (bloodDonor) {
        await tx.bloodDonor.update({
          where: { userId },
          data: {
            name: donorData.name,
            bloodGroup: donorData.bloodGroup,
            gender: donorData.gender,
            division: donorData.division || updatedUser.division || '',
            district: donorData.district || updatedUser.district || '',
            upazila: donorData.upazila || updatedUser.upazila || '',
            area: donorData.area,
            latitude: donorData.latitude,
            longitude: donorData.longitude,
            lastDonationDate: donorData.lastDonationDate,
          }
        });
      }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const getDonorList = async (filters: Record<string, unknown>) => {
  const { bloodGroup: bg, division, district, upazila, searchTerm } = filters;
  console.log(filters);

  const andConditions = [];

  if (searchTerm) {
    const searchBg = bloodGroupMap[searchTerm as keyof typeof bloodGroupMap];
    andConditions.push({
      OR: [
        { email: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
        { contactNumber: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
        { donorProfile: { name: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } } },
        ...(searchBg ? [{ donorProfile: { bloodGroup: { equals: searchBg } } }] : []),
      ]
    });
  }

  if (bg) {
    const bloodGroupValue = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;
    andConditions.push({
      donorProfile: { bloodGroup: { equals: bloodGroupValue as BloodGroup } }
    });
  }

  if (division) {
    andConditions.push({ division: { equals: division as string } });
  }

  if (district) {
    andConditions.push({ district: { equals: district as string } });
  }

  if (upazila) {
    andConditions.push({ upazila: { equals: upazila as string } });
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return result.map(({ password: _password, ...userWithoutPassword }) => userWithoutPassword);
};

const getDonationHistory = async (user: JwtPayload) => {
  const { userId } = user;

  const bloodDonor = await prisma.bloodDonor.findUnique({
    where: { userId },
  });

  if (!bloodDonor) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood donor profile not found");
  }

  const result = await prisma.donationHistory.findMany({
    where: {
      bloodDonorId: bloodDonor.id,
      isDeleted: false,
    },
    orderBy: {
      donationDate: 'desc',
    },
    include: {
      receiverOrg: {
        select: {
          id: true,
          email: true,
          contactNumber: true,
          organisation: true,
          hospital: true,
        },
      },
    },
  });

  return result;
};

export const UserServices = {
  getMyProfile,
  updateMyProfile,
  getDonorList,
  getDonationHistory,
};