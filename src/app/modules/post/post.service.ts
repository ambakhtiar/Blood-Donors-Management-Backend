import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { ICreatePost, IPaginationOptions, IPostFilters } from './post.interface';
import { PostType, UserRole, Prisma, BloodGroup } from '../../../generated/prisma';
import { sendNotificationEmail } from '../../utils/sendEmail';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const createPost = async (user: JwtPayload, payload: ICreatePost) => {
  const { userId, role } = user;

  // Fetch donor profile to get blood group if missing and for eligibility checks
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId },
  });

  const bloodDonor = await prisma.bloodDonor.findUnique({
    where: { userId },
  });

  // If role is USER, we can auto-populate bloodGroup if it's missing
  if (role === UserRole.USER && !payload.bloodGroup) {
    const profileBloodGroup = donorProfile?.bloodGroup || bloodDonor?.bloodGroup;
    if (!profileBloodGroup) {
      throw new AppError(httpStatus.BAD_REQUEST, "Blood group is required. Please complete your donor profile.");
    }
    payload.bloodGroup = profileBloodGroup;
  } else if (payload.bloodGroup) {
    // Convert blood group to enum 
    payload.bloodGroup = bloodGroupMap[payload.bloodGroup as keyof typeof bloodGroupMap] || (payload.bloodGroup as BloodGroup);
  }

  // Rule Engine for Blood Donation Posts 
  if (payload.type === PostType.BLOOD_DONATION) {
    if (!bloodDonor && !donorProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "Donor profile not found. Please complete your profile to donate blood.");
    }

    const currentDonor = bloodDonor || { lastDonationDate: donorProfile?.lastDonationDate, gender: donorProfile?.gender };

    const donationDate = payload.donationTime ? new Date(payload.donationTime) : new Date();

    // Check eligibility based on last donation
    if (currentDonor.lastDonationDate) {
      const lastDonation = new Date(currentDonor.lastDonationDate);
      const timeDiff = donationDate.getTime() - lastDonation.getTime();
      const monthDiff = timeDiff / (1000 * 60 * 60 * 24 * 30);

      const requiredMonths = currentDonor.gender === 'MALE' ? 2 : 3;

      if (monthDiff < requiredMonths && monthDiff >= 0) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `You are not eligible to donate blood yet. Required waiting time: ${requiredMonths} months.`
        );
      }
    }

    // Transaction to create post, history and update donor
    return await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          ...payload,
          donationTime: donationDate,
          authorId: userId,
          isApproved: true,
          isVerified: false
        },
      });

      if (bloodDonor) {
        // Calculate the next donation count
        const previousDonationsCount = await tx.donationHistory.count({
          where: { bloodDonorId: bloodDonor.id, isDeleted: false },
        });

        await tx.donationHistory.create({
          data: {
            bloodDonorId: bloodDonor.id,
            donationDate: donationDate,
            donationCount: previousDonationsCount + 1,
          }
        });

        await tx.bloodDonor.update({
          where: { id: bloodDonor.id },
          data: { lastDonationDate: donationDate },
        });
      }

      if (donorProfile) {
        await tx.donorProfile.update({
          where: { id: donorProfile.id },
          data: { lastDonationDate: donationDate },
        });
      }

      return post;
    });
  }

  const result = await prisma.post.create({
    data: {
      ...payload,
      donationTime: payload.donationTime ? new Date(payload.donationTime) : undefined,
      authorId: userId,
      isApproved: true,
      isVerified: false
    },
  });

  // Smart Area Alert for BLOOD_FINDING posts
  if (payload.type === PostType.BLOOD_FINDING) {
    const matchingDonors = await prisma.bloodDonor.findMany({
      where: {
        bloodGroup: payload.bloodGroup,
        division: payload.division,
        district: payload.district,
        upazila: payload.upazila,
        isAvailable: true,
      },
      include: {
        user: true,
      },
    });

    matchingDonors.forEach((donor) => {
      if (donor.user?.email) {
        sendNotificationEmail(
          donor.user.email,
          "Urgent Blood Required!",
          `Someone needs ${payload.bloodGroup} blood in your area (${payload.district}, ${payload.upazila}). Please check our platform for details.`
        );
      }
    });
  }

  return result;
};


const getAllPosts = async (filters: IPostFilters, options: IPaginationOptions) => {
  const { searchTerm, type, bloodGroup: bg, division, district, upazila } = filters;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const bloodGroup = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;

  const andConditions: Prisma.PostWhereInput[] = [];

  if (searchTerm) {
    const searchBg = bloodGroupMap[searchTerm as keyof typeof bloodGroupMap];
    andConditions.push({
      OR: [
        { content: { contains: searchTerm, mode: 'insensitive' } },
        ...(searchBg ? [{ bloodGroup: { equals: searchBg } }] : []),
      ],
    });
  }

  if (type) andConditions.push({ type });
  if (bloodGroup) andConditions.push({ bloodGroup });
  if (division) andConditions.push({ division });
  if (district) andConditions.push({ district });
  if (upazila) andConditions.push({ upazila });

  andConditions.push({ isDeleted: false });

  const whereConditions: Prisma.PostWhereInput = { AND: andConditions };

  const result = await prisma.post.findMany({
    where: whereConditions,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          contactNumber: true,
          role: true,
          bloodDonor: true,
          hospital: true,
          organisation: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    },
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.post.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglePost = async (postId: string) => {
  const result = await prisma.post.findUnique({
    where: {
      id: postId,
      isDeleted: false
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          contactNumber: true,
          role: true,
          bloodDonor: true,
          hospital: true,
          organisation: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      },
      likes: {
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              contactNumber: true,
              role: true,
              donorProfile: { select: { name: true } },
              hospital: { select: { name: true } },
              organisation: { select: { name: true } },
              admin: { select: { name: true } },
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      comments: {
        where: { parentId: null },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              contactNumber: true,
              role: true,
              donorProfile: { select: { name: true } },
              hospital: { select: { name: true } },
              organisation: { select: { name: true } },
              admin: { select: { name: true } },
            }
          },
          replies: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  contactNumber: true,
                  role: true,
                  donorProfile: { select: { name: true } },
                  hospital: { select: { name: true } },
                  organisation: { select: { name: true } },
                  admin: { select: { name: true } },
                }
              },
              replies: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  updatedAt: true,
                  user: {
                    select: {
                      id: true,
                      email: true,
                      contactNumber: true,
                      role: true,
                      donorProfile: { select: { name: true } },
                      hospital: { select: { name: true } },
                      organisation: { select: { name: true } },
                      admin: { select: { name: true } },
                    }
                  },
                },
                orderBy: { createdAt: 'asc' }
              },
            },
            orderBy: { createdAt: 'asc' }
          },
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');
  }

  return result;
};

const updatePost = async (postId: string, user: JwtPayload, payload: Partial<ICreatePost>) => {
  const { userId, role } = user;

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');

  // Authorization: Author or Admin
  if (post.authorId !== userId && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this post. Only the author or an admin can make changes.');
  }

  return await prisma.post.update({
    where: { id: postId },
    data: payload,
  });
};

const deletePost = async (postId: string, user: JwtPayload) => {
  const { userId, role } = user;

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');

  // Authorization: Author or Admin
  if (post.authorId !== userId && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this post. Only the author or an admin can delete it.');
  }

  return await prisma.post.update({
    where: { id: postId },
    data: { isDeleted: true },
  });
};

const resolvePost = async (postId: string, user: JwtPayload) => {
  const { userId } = user;

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');

  if (post.type !== PostType.BLOOD_FINDING) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Only "Blood Finding" posts can be marked as resolved. This action is not available for this post type.');
  }

  if (post.authorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only the original author of this post can mark it as resolved.');
  }

  return await prisma.post.update({
    where: { id: postId },
    data: { isResolved: true },
  });
};

const approvePost = async (postId: string, user: JwtPayload) => {
  const { role } = user;

  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied. You do not have permission to approve posts.');
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');

  return await prisma.post.update({
    where: { id: postId },
    data: { isApproved: true },
  });
};

const verifyPost = async (postId: string, user: JwtPayload) => {
  const { role } = user;

  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied. You do not have permission to verify posts.');
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');
  }

  return await prisma.post.update({
    where: { id: postId },
    data: { isVerified: true },
  });
};

export const PostServices = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  resolvePost,
  approvePost,
  verifyPost,
};
