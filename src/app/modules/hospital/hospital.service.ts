import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { IRecordDonationPayload, IUpdateRequestStatusPayload } from './hospital.interface';
import { Gender, PostType, RequestStatus } from '../../../generated/prisma';
import { sendNotificationEmail } from '../../utils/sendEmail';

const recordDonation = async (hospitalId: string, payload: IRecordDonationPayload) => {
  return await prisma.$transaction(async (tx) => {
    // Find or create BloodDonor
    let bloodDonor = await tx.bloodDonor.findUnique({
      where: { contactNumber: payload.contactNumber },
    });

    if (!bloodDonor) {
      if (!payload.name || !payload.bloodGroup || !payload.gender) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Name, blood group, and gender are required to register a new donor profile.'
        );
      }
      bloodDonor = await tx.bloodDonor.create({
        data: {
          name: payload.name,
          contactNumber: payload.contactNumber,
          bloodGroup: payload.bloodGroup,
          gender: payload.gender as Gender,
          isAvailable: true,
          division: payload.division || '',
          district: payload.district || '',
          upazila: payload.upazila || '',
          area: payload.area,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      });
    }

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
          'A pending request already exists for this donor.'
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
        sendNotificationEmail(
          user.email,
          "Donation Record Request",
          "A hospital has recorded a blood donation under your name. Please log in to your account and go to requests to accept or decline the record."
        );
      }

      return { type: 'REQUEST_SENT', data: request };
    }

    // Scenario B & C: Unregistered / New Donor
    await tx.bloodDonor.update({
      where: { id: bloodDonor.id },
      data: { lastDonationDate: new Date() },
    });

    await tx.donationHistory.create({
      data: {
        bloodDonorId: bloodDonor.id,
        receiverOrgId: hospitalId,
        donationDate: new Date(),
        weightDuringDonation: payload.weight,
      },
    });

    const hospitalRecord = await tx.hospitalDonationRecord.create({
      data: {
        hospitalId,
        bloodDonorId: bloodDonor.id,
        donationDate: new Date(),
        weight: payload.weight,
      },
    });

    if (payload.createPost) {
      await tx.post.create({
        data: {
          authorId: hospitalId,
          type: PostType.BLOOD_DONATION,
          bloodGroup: bloodDonor.bloodGroup,
          donationTime: new Date(),
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
    throw new AppError(httpStatus.NOT_FOUND, 'Hospital request not found');
  }

  const bloodDonor = await prisma.bloodDonor.findUnique({
    where: { userId },
  });

  if (!bloodDonor || request.bloodDonorId !== bloodDonor.id) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this request');
  }

  if (request.status !== RequestStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This request has already been processed');
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

      // Automatically create a DonationHistory record
      await tx.donationHistory.create({
        data: {
          bloodDonorId: bloodDonor.id,
          receiverOrgId: request.hospitalId,
          donationDate: donationDate,
        },
      });

      // Automatically create a HospitalDonationRecord
      await tx.hospitalDonationRecord.create({
        data: {
          hospitalId: request.hospitalId,
          bloodDonorId: bloodDonor.id,
          donationDate: donationDate,
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

const getHospitalDonationRecords = async (hospitalId: string) => {
  const records = await prisma.hospitalDonationRecord.findMany({
    where: { hospitalId, isDeleted: false },
    include: {
      bloodDonor: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return records;
};

export const HospitalServices = {
  recordDonation,
  updateRequestStatus,
  getHospitalDonationRecords,
};
