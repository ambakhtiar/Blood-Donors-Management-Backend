import { Prisma, AccountStatus, UserRole } from "../../../generated/prisma";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { IOptions, IUserFilters } from "./admin.interface";
import { paginationHelper } from "../../helpers/paginationHelper";
import { sendNotificationEmail } from "../../utils/sendEmail";

const getAllUsers = async (filters: IUserFilters, options: IOptions) => {
  const { searchTerm, email, contactNumber, role, accountStatus } = filters;
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { email: { contains: searchTerm, mode: "insensitive" } },
        { contactNumber: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (email) andConditions.push({ email: { contains: email, mode: "insensitive" } });
  if (contactNumber) andConditions.push({ contactNumber: { contains: contactNumber, mode: "insensitive" } });
  if (role) andConditions.push({ role: role as UserRole });
  if (accountStatus) andConditions.push({ accountStatus });

  andConditions.push({ isDeleted: false });

  const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      donorProfile: true,
      bloodDonor: true,
      hospital: true,
      organisation: true,
      admin: true,
      superAdmin: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getAllHospitals = async (filters: IUserFilters, options: IOptions) => {
  return await getAllUsers({ ...filters, role: UserRole.HOSPITAL }, options);
};

const getAllOrganisations = async (filters: IUserFilters, options: IOptions) => {
  return await getAllUsers({ ...filters, role: UserRole.ORGANISATION }, options);
};

const changeUserStatus = async (id: string, status: AccountStatus, requester: JwtPayload) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found. The account may have been deleted or the ID is incorrect.');
  }

  // Security checks
  if (user.id === requester.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot change your own account status."
    );
  }

  if (requester.role === UserRole.ADMIN && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to change the status of other administrative accounts."
    );
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      accountStatus: status,
    },
  });

  if (result.email && (status === AccountStatus.ACTIVE || status === AccountStatus.BLOCKED)) {
    sendNotificationEmail(
      result.email,
      "Account Status Update",
      `Your account status has been changed to ${status} by the administrator.`
    );
  }

  return result;
};

const updateHospitalStatus = async (id: string, status: AccountStatus, requester: JwtPayload) => {
  const user = await prisma.user.findUnique({
    where: { id, role: UserRole.HOSPITAL, isDeleted: false },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hospital account not found. Please verify the ID is correct.');
  }

  return await changeUserStatus(id, status, requester);
};

const updateOrganisationStatus = async (id: string, status: AccountStatus, requester: JwtPayload) => {
  const user = await prisma.user.findUnique({
    where: { id, role: UserRole.ORGANISATION, isDeleted: false },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Organisation account not found. Please verify the ID is correct.');
  }

  return await changeUserStatus(id, status, requester);
};

const getSystemAnalytics = async () => {
  const [
    totalUsers,
    totalPosts,
    totalBloodDonors,
    totalDonationHistories,
    totalHospital,
    pendingHospital,
    rejectedHospital,
    activeHospital,
    blockedHospital,
    totalOrg,
    pendingOrg,
    rejectedOrg,
    activeOrg,
    blockedOrg,
    totalStandardUser,
    blockedUser,
    rejectedUser,
    totalAdmin,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.post.count({ where: { isDeleted: false } }),
    prisma.bloodDonor.count({ where: { isDeleted: false } }),
    prisma.donationHistory.count({ where: { isDeleted: false } }),
    // Hospital counts
    prisma.user.count({ where: { role: UserRole.HOSPITAL, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.HOSPITAL, accountStatus: AccountStatus.PENDING, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.HOSPITAL, accountStatus: AccountStatus.REJECTED, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.HOSPITAL, accountStatus: AccountStatus.ACTIVE, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.HOSPITAL, accountStatus: AccountStatus.BLOCKED, isDeleted: false } }),
    // Organisation counts
    prisma.user.count({ where: { role: UserRole.ORGANISATION, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.ORGANISATION, accountStatus: AccountStatus.PENDING, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.ORGANISATION, accountStatus: AccountStatus.REJECTED, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.ORGANISATION, accountStatus: AccountStatus.ACTIVE, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.ORGANISATION, accountStatus: AccountStatus.BLOCKED, isDeleted: false } }),
    // Generic users (role USER)
    prisma.user.count({ where: { role: UserRole.USER, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.USER, accountStatus: AccountStatus.BLOCKED, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.USER, accountStatus: AccountStatus.REJECTED, isDeleted: false } }),
    // Admin count
    prisma.user.count({ where: { role: UserRole.ADMIN, isDeleted: false } }),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalBloodDonors,
    totalDonationHistories,
    totalHospital,
    pendingHospital,
    rejectedHospital,
    activeHospital,
    blockedHospital,
    totalOrg,
    pendingOrg,
    rejectedOrg,
    activeOrg,
    blockedOrg,
    totalStandardUser,
    blockedUser,
    rejectedUser,
    totalAdmin,
  };
};

export const AdminServices = {
  getAllUsers,
  changeUserStatus,
  getSystemAnalytics,
  getAllHospitals,
  getAllOrganisations,
  updateHospitalStatus,
  updateOrganisationStatus,
};
