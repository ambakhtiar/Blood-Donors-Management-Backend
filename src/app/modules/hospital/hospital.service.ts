import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { IRecordDonationPayload, IUpdateRequestStatusPayload, IHospitalDonationRecordFilters, IPaginationOptions } from './hospital.interface';
import { Gender, PostType, RequestStatus, BloodGroup, Prisma } from '../../../generated/prisma';
import { sendNotificationEmail } from '../../utils/sendEmail';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const recordDonation = async (hospitalId: string, payload: IRecordDonationPayload) => {
    const mappedBloodGroup = payload.bloodGroup ? (bloodGroupMap[payload.bloodGroup as keyof typeof bloodGroupMap] || (payload.bloodGroup as BloodGroup)) : undefined;

    return await prisma.$transaction(async (tx) => {
        // Find or create BloodDonor
        let bloodDonor = await tx.bloodDonor.findUnique({
            where: { contactNumber: payload.contactNumber },
            include: { user: { include: { donorProfile: true } } }
        });

        // Fetch hospital location for fallback
        const hospitalUser = await tx.user.findUnique({
            where: { id: hospitalId },
        });

        // Determine the final name based on priority (User Profile > Payload)
        const donorProfile = (bloodDonor as any)?.user?.donorProfile;
        const finalName = donorProfile?.name || payload.name;

        if (!bloodDonor) {
            if (!payload.name || !payload.bloodGroup || !payload.gender) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Name, blood group, and gender are required to register a new donor profile.'
                );
            }

            bloodDonor = await tx.bloodDonor.create({
                data: {
                    name: finalName,
                    contactNumber: payload.contactNumber,
                    bloodGroup: mappedBloodGroup as BloodGroup,
                    gender: payload.gender as Gender,
                    isAvailable: true,
                    division: payload.division || hospitalUser?.division || '',
                    district: payload.district || hospitalUser?.district || '',
                    upazila: payload.upazila || hospitalUser?.upazila || '',
                    area: payload.area,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                },
                include: { user: { include: { donorProfile: true } } }
            });
        }

        // Unified Validation Check
        const lastDonationDate = bloodDonor.lastDonationDate || donorProfile?.lastDonationDate;
        const gender = bloodDonor.gender || donorProfile?.gender;

        if (lastDonationDate) {
            const lastDonation = new Date(lastDonationDate);
            const today = new Date();
            const timeDiff = today.getTime() - lastDonation.getTime();
            const monthDiff = timeDiff / (1000 * 60 * 60 * 24 * 30);
            const requiredMonths = gender === 'FEMALE' ? 3 : 2;

            if (monthDiff < requiredMonths && monthDiff >= 0) {
                throw new AppError(
                    httpStatus.FORBIDDEN,
                    `Donor ${bloodDonor.name} is not eligible to donate blood yet. A minimum gap of ${requiredMonths} months is required for ${gender.toLowerCase()} donors. Remaining time: ${Math.max(0, requiredMonths - Math.floor(monthDiff))} months.`
                );
            }
        }

        // Integrity check for blood group and gender matching
        if (bloodDonor.bloodGroup !== mappedBloodGroup || bloodDonor.gender !== payload.gender) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Provided information does not match our records for ${bloodDonor.name}. (Expected: ${bloodDonor.bloodGroup}, ${bloodDonor.gender} | Provided: ${mappedBloodGroup}, ${payload.gender}). Please verify the donor's details.`
            );
        }

        // IMMEDIATE ACTION: Always create HospitalDonationRecord
        const donationDate = new Date();
        const hospitalRecord = await tx.hospitalDonationRecord.create({
            data: {
                hospitalId,
                bloodDonorId: bloodDonor.id,
                donationDate: donationDate,
                weight: payload.weight,
            },
        });

        // Scenario A: Registered Platform User
        if (bloodDonor.userId !== null) {
            const existingRequest = await tx.hospitalRequest.findFirst({
                where: {
                    hospitalId,
                    bloodDonorId: bloodDonor.id,
                    status: RequestStatus.PENDING,
                },
            });

            if (existingRequest) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'A donation request has already been sent to this donor and is awaiting their response. Please wait for them to accept or decline before sending another.'
                );
            }

            const request = await tx.hospitalRequest.create({
                data: {
                    hospitalId,
                    bloodDonorId: bloodDonor.id,
                    status: RequestStatus.PENDING,
                },
            });

            const user = await tx.user.findUnique({
                where: { id: bloodDonor.userId as string }
            });

            if (user?.email) {
                const title = "Donation Record Request";
                const message = "A hospital has recorded a blood donation under your name. Please log in to your account and go to requests to accept or decline the record.";

                // Create in-app notification record
                await tx.notification.create({
                    data: {
                        userId: bloodDonor.userId as string,
                        title,
                        message,
                        type: "DONATION_RECORD_REQUEST"
                    }
                });

                sendNotificationEmail(user.email, title, message);
            }

            return { type: 'REQUEST_SENT', data: { request, hospitalRecord } };
        }

        // SCENARIO B/C: Directly Record for Unregistered Donor
        await tx.bloodDonor.update({
            where: { id: bloodDonor.id },
            data: { lastDonationDate: donationDate },
        });

        // Sync with DonorProfile if exists
        const donorProfileId = (bloodDonor as any).user?.donorProfile?.id;
        if (donorProfileId) {
            await tx.donorProfile.update({
                where: { id: donorProfileId },
                data: { lastDonationDate: donationDate },
            });
        }

        const previousDonationsCount = await tx.donationHistory.count({
            where: { bloodDonorId: bloodDonor.id, isDeleted: false },
        });

        await tx.donationHistory.create({
            data: {
                bloodDonorId: bloodDonor.id,
                receiverOrgId: hospitalId,
                donationDate: donationDate,
                donationCount: previousDonationsCount + 1,
                weightDuringDonation: payload.weight,
            },
        });

        if (payload.createPost) {
            await tx.post.create({
                data: {
                    authorId: hospitalId,
                    type: PostType.BLOOD_DONATION,
                    bloodGroup: bloodDonor.bloodGroup,
                    donationTime: donationDate,
                    content: payload.postContent || `Blood donation received from ${bloodDonor.name}`,
                    isApproved: true,
                    isVerified: false,
                },
            });
        }

        return { type: 'DONATION_RECORDED', data: hospitalRecord };
    });
};

const updateRequestStatus = async (
    userId: string,
    requestId: string,
    payload: IUpdateRequestStatusPayload
) => {
    const request = await prisma.hospitalRequest.findUnique({
        where: { id: requestId, isDeleted: false },
        include: { bloodDonor: true },
    });

    if (!request) {
        throw new AppError(httpStatus.NOT_FOUND, 'Donation request not found. It may have already been processed or the ID is incorrect.');
    }

    const bloodDonor = await prisma.bloodDonor.findUnique({
        where: { userId },
    });

    if (!bloodDonor || request.bloodDonorId !== bloodDonor.id) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to respond to this request. This request was not sent to your donor profile.');
    }

    if (request.status !== RequestStatus.PENDING) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This donation request has already been responded to and cannot be changed again.');
    }

    if (payload.status === RequestStatus.ACCEPTED) {
        return await prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.hospitalRequest.update({
                where: { id: requestId },
                data: { status: RequestStatus.ACCEPTED },
            });

            const donationDate = request.createdAt;

            // Update donor profile lastDonationDate
            await tx.bloodDonor.update({
                where: { id: bloodDonor.id },
                data: { lastDonationDate: donationDate },
            });

            // Sync with DonorProfile
            const donorUser = await tx.user.findUnique({
                where: { id: userId },
                include: { donorProfile: true }
            });

            if (donorUser?.donorProfile) {
                await tx.donorProfile.update({
                    where: { id: donorUser.donorProfile.id },
                    data: { lastDonationDate: donationDate },
                });
            }

            // Automatically create a DonationHistory record
            const previousDonationsCount = await tx.donationHistory.count({
                where: { bloodDonorId: bloodDonor.id, isDeleted: false },
            });

            await tx.donationHistory.create({
                data: {
                    bloodDonorId: bloodDonor.id,
                    receiverOrgId: request.hospitalId,
                    donationDate: donationDate,
                    donationCount: previousDonationsCount + 1,
                },
            });

            // Automatically create a post for the blood donor
            await tx.post.create({
                data: {
                    authorId: userId,
                    type: PostType.BLOOD_DONATION,
                    bloodGroup: request.bloodDonor.bloodGroup,
                    donationTime: donationDate,
                    content: `Successfully recorded a blood donation. It feels great to save a life!`,
                    isApproved: true,
                    isVerified: false,
                }
            });

            return updatedRequest;
        });
    }

    return await prisma.hospitalRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.REJECTED },
    });
};


const getHospitalDonationRecords = async (
    hospitalId: string, filters: IHospitalDonationRecordFilters, options: IPaginationOptions
) => {
    const { searchTerm, bloodGroup: bg, division, district, upazila, donorName } = filters;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const bloodGroupValue = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;

    const andConditions: Prisma.HospitalDonationRecordWhereInput[] = [
        { hospitalId, isDeleted: false }
    ];

    if (searchTerm) {
        andConditions.push({
            bloodDonor: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { contactNumber: { contains: searchTerm, mode: 'insensitive' } },
                ]
            }
        });
    }

    if (donorName) {
        andConditions.push({
            bloodDonor: { name: { contains: donorName, mode: 'insensitive' } }
        });
    }

    if (bloodGroupValue) {
        andConditions.push({
            bloodDonor: { bloodGroup: bloodGroupValue }
        });
    }

    if (division) andConditions.push({ bloodDonor: { division } });
    if (district) andConditions.push({ bloodDonor: { district } });
    if (upazila) andConditions.push({ bloodDonor: { upazila } });

    const whereConditions: Prisma.HospitalDonationRecordWhereInput = { AND: andConditions };

    const [records, total] = await Promise.all([
        prisma.hospitalDonationRecord.findMany({
            where: whereConditions,
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
            include: {
                bloodDonor: true,
            },
        }),
        prisma.hospitalDonationRecord.count({ where: whereConditions }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: records,
    };
};

const updateHospitalDonationRecord = async (
    hospitalId: string,
    recordId: string,
    payload: any
) => {
    const record = await prisma.hospitalDonationRecord.findUnique({
        where: { id: recordId, isDeleted: false },
    });

    if (!record) {
        throw new AppError(httpStatus.NOT_FOUND, 'Donation record not found or already deleted.');
    }

    if (record.hospitalId !== hospitalId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this record as it was not registered by your hospital.');
    }

    // Update the associated BloodDonor directly
    await prisma.bloodDonor.update({
        where: { id: record.bloodDonorId },
        data: payload,
    });

    // Return the updated joined record
    return await prisma.hospitalDonationRecord.findUnique({
        where: { id: recordId },
        include: { bloodDonor: true }
    });
};

const deleteHospitalDonationRecord = async (hospitalId: string, recordId: string) => {
    const record = await prisma.hospitalDonationRecord.findUnique({
        where: { id: recordId, isDeleted: false },
    });

    if (!record) {
        throw new AppError(httpStatus.NOT_FOUND, 'Donation record not found or already deleted.');
    }

    if (record.hospitalId !== hospitalId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this record.');
    }

    return await prisma.hospitalDonationRecord.update({
        where: { id: recordId },
        data: { isDeleted: true },
    });
};

export const HospitalServices = {
    recordDonation,
    updateRequestStatus,
    getHospitalDonationRecords,
    updateHospitalDonationRecord,
    deleteHospitalDonationRecord,
};
