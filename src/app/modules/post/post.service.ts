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

    // Convert blood group to enum if provided
    if (payload.bloodGroup) {
        payload.bloodGroup = (bloodGroupMap[payload.bloodGroup as keyof typeof bloodGroupMap] || (payload.bloodGroup as BloodGroup));
    }

    // Fetch author info for later use (checking if user-role creator didn't provide blood group)
    const authorSnapshot = await prisma.user.findUnique({
        where: { id: userId },
        include: { donorProfile: true, bloodDonor: true }
    });

    if (role === UserRole.USER && !payload.bloodGroup) {
        const profileBloodGroup = authorSnapshot?.donorProfile?.bloodGroup || authorSnapshot?.bloodDonor?.bloodGroup;
        if (!profileBloodGroup) {
            throw new AppError(httpStatus.BAD_REQUEST, "Blood group is required. Please complete your donor profile.");
        }
        payload.bloodGroup = profileBloodGroup;
    }

    // Rule Engine for Blood Donation Posts 
    if (payload.type === PostType.BLOOD_DONATION) {
        const donorContactNumber = payload.contactNumber;
        if (!donorContactNumber) {
            throw new AppError(httpStatus.BAD_REQUEST, "Donor contact number is required for donation posts.");
        }

        // Identify the Donor
        const donorUser = await prisma.user.findUnique({
            where: { contactNumber: donorContactNumber },
            include: { donorProfile: true, bloodDonor: true }
        });

        const donorRecord = donorUser?.bloodDonor || await prisma.bloodDonor.findUnique({
            where: { contactNumber: donorContactNumber }
        });

        const donorProfile = donorUser?.donorProfile;

        const donationDate = payload.donationTime ? new Date(payload.donationTime) : new Date();

        // Check Eligibility
        if (donorRecord || donorProfile) {
            const lastDonationDate = donorRecord?.lastDonationDate || donorProfile?.lastDonationDate;
            const gender = donorRecord?.gender || donorProfile?.gender;

            if (lastDonationDate) {
                const lastDonation = new Date(lastDonationDate);
                const timeDiff = donationDate.getTime() - lastDonation.getTime();
                const monthDiff = timeDiff / (1000 * 60 * 60 * 24 * 30);

                const requiredMonths = gender === 'FEMALE' ? 3 : 2;

                if (monthDiff < requiredMonths && monthDiff >= 0) {
                    throw new AppError(
                        httpStatus.FORBIDDEN,
                        `Donor is not eligible yet. Required waiting time: ${requiredMonths} months for ${gender?.toLowerCase() || 'this'} donor.`
                    );
                }
            }

            const bloodGroup = donorRecord?.bloodGroup || donorProfile?.bloodGroup;
            if (bloodGroup && bloodGroup !== payload.bloodGroup) {
                // console.log(donorRecord, donorProfile);
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    `Provided blood group (${payload.bloodGroup}) does not match our records (${bloodGroup}). Please verify the blood group information.`
                );
            }
        }

        // Transaction for Post Creation and Donor Tracking
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

            let finalBloodDonorId: string;

            if (donorRecord) {
                finalBloodDonorId = donorRecord.id;
                // Update BloodDonor
                await tx.bloodDonor.update({
                    where: { id: donorRecord.id },
                    data: { lastDonationDate: donationDate },
                });
            } else {
                // Create new BloodDonor if not exists
                const bloodDonorData: any = {
                    name: donorUser?.donorProfile?.name || payload.title || "Unknown Donor",
                    contactNumber: donorContactNumber,
                    bloodGroup: payload.bloodGroup as BloodGroup,
                    gender: authorSnapshot?.donorProfile?.gender || payload.gender || "MALE",
                    isAvailable: true,
                    lastDonationDate: donationDate,
                    division: payload.division || authorSnapshot?.division || "Unknown",
                    district: payload.district || authorSnapshot?.district || "Unknown",
                    upazila: payload.upazila || authorSnapshot?.upazila || "Unknown",
                };
                if (donorUser) {
                    bloodDonorData.userId = donorUser.id;
                }
                const newBloodDonor = await tx.bloodDonor.create({ data: bloodDonorData });
                finalBloodDonorId = newBloodDonor.id;
            }

            // Add Donation History
            const previousDonationsCount = await tx.donationHistory.count({
                where: { bloodDonorId: finalBloodDonorId, isDeleted: false },
            });

            await tx.donationHistory.create({
                data: {
                    bloodDonorId: finalBloodDonorId,
                    donationDate: donationDate,
                    donationCount: previousDonationsCount + 1,
                    userId: role === UserRole.USER ? userId : undefined,
                    receiverOrgId: role === UserRole.HOSPITAL || role === UserRole.ORGANISATION ? userId : undefined,
                    postId: post.id
                }
            });

            // Update Donor Profile if User exists
            if (donorProfile) {
                await tx.donorProfile.update({
                    where: { id: donorProfile.id },
                    data: { lastDonationDate: donationDate },
                });
            }

            // Notification for Donor User
            if (donorUser && donorUser.id !== userId) {
                const title = "Heroic Contribution Recorded!";
                const message = "You are a hero! Your blood donation has been recorded. Thank you for your life-saving contribution. Stay healthy and keep living for others.";

                await tx.notification.create({
                    data: {
                        userId: donorUser.id,
                        title,
                        message,
                        type: "DONATION_RECORDED"
                    }
                });

                if (donorUser.email) {
                    try {
                        await sendNotificationEmail(donorUser.email, title, message);
                    } catch (error) {
                        console.error("Failed to send donor notification email", error);
                    }
                }
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


const getAllPosts = async (filters: IPostFilters, options: IPaginationOptions, user?: JwtPayload) => {
    const userId = user?.userId;
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
                    profilePictureUrl: true,
                    donorProfile: true,
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
            likes: userId ? {
                where: { userId },
                select: { userId: true }
            } : false
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.post.count({ where: whereConditions });

    const postsWithLikedStatus = result.map((post) => {
        const { likes, ...postData } = post;
        return {
            ...postData,
            hasLiked: !!(likes && likes.length > 0)
        };
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: postsWithLikedStatus,
    };
};

// Get all posts by a specific userId
const getPostsByUserId = async (userId: string, options: IPaginationOptions = {}) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const whereConditions: Prisma.PostWhereInput = {
        authorId: userId,
        isDeleted: false,
    };

    const result = await prisma.post.findMany({
        where: whereConditions,
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    contactNumber: true,
                    role: true,
                    profilePictureUrl: true,
                    donorProfile: true,
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

const getSinglePost = async (postId: string, user?: JwtPayload) => {
    const userId = user?.userId;
    const query = {
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
                    profilePictureUrl: true,
                    donorProfile: true,
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
                            profilePictureUrl: true,
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
                                    profilePictureUrl: true,
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
                                            profilePictureUrl: true,
                                            donorProfile: { select: { name: true } },
                                            hospital: { select: { name: true } },
                                            organisation: { select: { name: true } },
                                            admin: { select: { name: true } },
                                        }
                                    },
                                },
                                orderBy: [{ createdAt: 'asc' as const }]
                            },
                        },
                        orderBy: [{ createdAt: 'asc' as const }]
                    },
                },
                orderBy: [{ createdAt: 'desc' as const }]
            },
            likes: userId ? {
                where: { userId },
                select: { userId: true }
            } : {
                take: 0 // If no user, we don't need to check specific liked status here as we have the count and list below
            }
        }
    };

    const result = await prisma.post.findUnique(query);

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');
    }

    const { likes, ...postData } = result as Prisma.PostGetPayload<typeof query>;
    const hasLiked = !!(likes && likes.length > 0);

    // Fetch full likes list if needed (already in the query above, but we need to keep a separate logic for the list)
    const fullResult = await prisma.post.findUnique({
        where: { id: postId },
        include: {
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
                            profilePictureUrl: true,
                            donorProfile: { select: { name: true } },
                            hospital: { select: { name: true } },
                            organisation: { select: { name: true } },
                            admin: { select: { name: true } },
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return {
        ...postData,
        hasLiked,
        likes: fullResult?.likes || []
    };
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
    getPostsByUserId,
};
