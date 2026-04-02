import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { IUpdateProfilePayload } from "./user.interface";
import { Prisma, UserRole, BloodGroup, Gender } from "../../../generated/prisma";
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
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile could not be found. Please contact support.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};


const updateMyProfile = async (userId: string, role: string, payload: IUpdateProfilePayload) => {
  // If the payload is flat, we might have fields in userData that belong to specific profiles
  let { donorProfile, hospital, organisation, ...userData } = payload;

  // 1. Check for unique Email and Contact Number
  const orConditions: Prisma.UserWhereInput[] = [];
  if (userData.email) orConditions.push({ email: userData.email });
  if (userData.contactNumber) orConditions.push({ contactNumber: userData.contactNumber });

  if (orConditions.length > 0) {
    const isExist = await prisma.user.findFirst({
      where: {
        OR: orConditions,
        id: { not: userId },
        isDeleted: false,
      },
    });

    if (isExist) {
      const field = isExist.email === userData.email ? 'Email' : 'Contact Number';
      throw new AppError(httpStatus.BAD_REQUEST, `${field} is already in use by another account.`);
    }
  }

  await prisma.$transaction(async (tx) => {
    // 2. Update Core User table fields
    const userUpdateData: Prisma.UserUpdateInput = {};
    if (userData.email) userUpdateData.email = userData.email;
    if (userData.contactNumber) userUpdateData.contactNumber = userData.contactNumber;
    if (userData.division) userUpdateData.division = userData.division;
    if (userData.district) userUpdateData.district = userData.district;
    if (userData.upazila) userUpdateData.upazila = userData.upazila;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // 3. Selective Role-specific Updates
    if (role === UserRole.USER) {
      // Use donorProfile if provided, otherwise fallback to root userData (flattened payload)
      const donorData = {
        ...(userData as any),
        ...(donorProfile || {}),
      };

      // Exclude sensitive/restricted fields 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bloodGroup, gender, ...restDonorInfo } = donorData;

      const donorUpdateData: Prisma.DonorProfileUpdateInput = {
        name: restDonorInfo.name,
        weight: restDonorInfo.weight,
        isAvailableForDonation: restDonorInfo.isAvailableForDonation,
        lastDonationDate: restDonorInfo.lastDonationDate ? new Date(restDonorInfo.lastDonationDate) : undefined,
      };

      // Filter out undefined/null values for DonorProfile update
      const filteredDonorUpdateData = Object.fromEntries(
        Object.entries(donorUpdateData).filter(([_, v]) => v !== undefined && v !== null)
      );

      if (Object.keys(filteredDonorUpdateData).length > 0) {
        await tx.donorProfile.update({
          where: { userId },
          data: filteredDonorUpdateData,
        });
      }

      // Synchronize with BloodDonor (This is high priority for the user)
      const bloodDonor = await tx.bloodDonor.findUnique({ where: { userId } });
      if (bloodDonor) {
        // Collect all potential location and profile fields for synchronization
        const syncData: Prisma.BloodDonorUpdateInput = {
          name: restDonorInfo.name || bloodDonor.name,
          contactNumber: userUpdateData.contactNumber ?? bloodDonor.contactNumber,
          division: donorData.division || updatedUser.division || bloodDonor.division,
          district: donorData.district || updatedUser.district || bloodDonor.district,
          upazila: donorData.upazila || updatedUser.upazila || bloodDonor.upazila,
          area: donorData.area || bloodDonor.area,
          latitude: donorData.latitude ?? bloodDonor.latitude,
          longitude: donorData.longitude ?? bloodDonor.longitude,
          lastDonationDate: donorUpdateData.lastDonationDate as Date || bloodDonor.lastDonationDate,
          isAvailable: restDonorInfo.isAvailableForDonation !== undefined ? restDonorInfo.isAvailableForDonation : bloodDonor.isAvailable,
        };

        await tx.bloodDonor.update({
          where: { userId },
          data: syncData,
        });
      }
    } else if (role === UserRole.HOSPITAL) {
      const hospitalData = { ...(userData as any), ...(hospital || {}) };
      const hospitalUpdateData: Prisma.HospitalUpdateInput = {
        name: hospitalData.name,
        registrationNumber: hospitalData.registrationNumber,
        address: hospitalData.address,
      };

      const filteredHospitalUpdateData = Object.fromEntries(
        Object.entries(hospitalUpdateData).filter(([_, v]) => v !== undefined && v !== null)
      );

      if (Object.keys(filteredHospitalUpdateData).length > 0) {
        await tx.hospital.update({
          where: { userId },
          data: filteredHospitalUpdateData,
        });
      }
    } else if (role === UserRole.ORGANISATION) {
      const organisationData = { ...(userData as any), ...(organisation || {}) };
      const organisationUpdateData: Prisma.OrganisationUpdateInput = {
        name: organisationData.name,
        registrationNumber: organisationData.registrationNumber,
        establishedYear: organisationData.establishedYear,
      };

      const filteredOrganisationUpdateData = Object.fromEntries(
        Object.entries(organisationUpdateData).filter(([_, v]) => v !== undefined && v !== null)
      );

      if (Object.keys(filteredOrganisationUpdateData).length > 0) {
        await tx.organisation.update({
          where: { userId },
          data: filteredOrganisationUpdateData,
        });
      }
    }
  });

  // 4. Return Full User Data with related Profile
  const finalResult = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      hospital: true,
      organisation: true,
      admin: true,
      superAdmin: true,
    },
  });

  if (!finalResult) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile was updated but could not be retrieved. Please refresh and try again.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = finalResult;
  return userWithoutPassword;
};

const getDonorList = async (filters: Record<string, unknown>) => {
  const { bloodGroup: bg, division, district, upazila, searchTerm } = filters;

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
    throw new AppError(httpStatus.NOT_FOUND, 'Donor profile not found. Please complete your donor profile setup to view donation history.');
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