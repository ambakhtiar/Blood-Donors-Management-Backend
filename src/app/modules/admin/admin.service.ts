import { Prisma, AccountStatus } from "../../../generated/prisma";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { IOptions, IUserFilters } from "./admin.interface";
import { paginationHelper } from "../../../helpers/paginationHelper";
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
  if (role) andConditions.push({ role: role as any });
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

const changeUserStatus = async (id: string, status: AccountStatus) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
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

const getSystemAnalytics = async () => {
  const [totalUsers, totalPosts, totalBloodDonors, totalDonationHistories] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.post.count({ where: { isDeleted: false } }),
    prisma.bloodDonor.count({ where: { isDeleted: false } }),
    prisma.donationHistory.count({ where: { isDeleted: false } }),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalBloodDonors,
    totalDonationHistories,
  };
};

export const AdminServices = {
  getAllUsers,
  changeUserStatus,
  getSystemAnalytics,
};
