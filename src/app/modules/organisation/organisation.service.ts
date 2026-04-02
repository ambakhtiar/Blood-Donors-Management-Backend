import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { IAddVolunteerPayload } from './organisation.interface';
import { Gender, RequestStatus, BloodGroup } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const addVolunteer = async (orgId: string, payload: IAddVolunteerPayload) => {
  const bloodDonor = await prisma.bloodDonor.findUnique({
    where: { contactNumber: payload.contactNumber },
  });

  if (bloodDonor) {
    const existingLink = await prisma.organisationVolunteer.findUnique({
      where: {
        organisationId_bloodDonorId: {
          organisationId: orgId,
          bloodDonorId: bloodDonor.id,
        },
      },
    });

    if (existingLink) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This volunteer is already linked to your organisation or has a pending invitation.');
    }

    const newLink = await prisma.organisationVolunteer.create({
      data: {
        organisationId: orgId,
        bloodDonorId: bloodDonor.id,
        status: RequestStatus.PENDING,
      },
    });

    return newLink;
  } else {
    // Manual entry
    if (!payload.name || !payload.bloodGroup || !payload.gender) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Name, blood group, and gender are required to register a new manual volunteer.'
      );
    }

    return await prisma.$transaction(async (tx) => {
      const mappedBloodGroup = payload.bloodGroup ? (bloodGroupMap[payload.bloodGroup as keyof typeof bloodGroupMap] || (payload.bloodGroup as BloodGroup)) : undefined;
      const newBloodDonor = await tx.bloodDonor.create({
        data: {
          name: payload.name as string,
          contactNumber: payload.contactNumber,
          bloodGroup: mappedBloodGroup as BloodGroup,
          gender: payload.gender as Gender,
          division: '',
          district: '',
          upazila: '',
        },
      });

      const link = await tx.organisationVolunteer.create({
        data: {
          organisationId: orgId,
          bloodDonorId: newBloodDonor.id,
          status: RequestStatus.ACCEPTED,
        },
      });

      return link;
    });
  }
};

const updateUnregisteredVolunteerDonation = async (
  orgId: string,
  bloodDonorId: string,
  date: string
) => {
  const volunteerLink = await prisma.organisationVolunteer.findUnique({
    where: {
      organisationId_bloodDonorId: {
        organisationId: orgId,
        bloodDonorId,
      },
    },
    include: { bloodDonor: true },
  });

  if (!volunteerLink || volunteerLink.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This volunteer is not linked to your organisation. Please verify the donor ID and try again.');
  }

  if (volunteerLink.bloodDonor.userId !== null) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This volunteer is a registered platform user. Their donation dates are updated automatically. Manual updates are only available for offline/unregistered volunteers.'
    );
  }

  const updatedDonor = await prisma.bloodDonor.update({
    where: { id: bloodDonorId },
    data: { lastDonationDate: new Date(date) },
  });

  return updatedDonor;
};

const getOrganisationVolunteers = async (orgId: string) => {
  return await prisma.organisationVolunteer.findMany({
    where: { organisationId: orgId, isDeleted: false },
    include: {
      bloodDonor: {
        select: {
          id: true,
          name: true,
          contactNumber: true,
          bloodGroup: true,
          gender: true,
          lastDonationDate: true,
          isAvailable: true,
          userId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getVolunteerDonationHistory = async (orgId: string) => {
  const volunteers = await prisma.organisationVolunteer.findMany({
    where: { organisationId: orgId, isDeleted: false },
    select: { bloodDonorId: true },
  });

  const bloodDonorIds = volunteers.map((v) => v.bloodDonorId);

  return await prisma.donationHistory.findMany({
    where: { bloodDonorId: { in: bloodDonorIds }, isDeleted: false },
    include: {
      bloodDonor: {
        select: {
          id: true,
          name: true,
          bloodGroup: true,
          gender: true,
        },
      },
      receiverOrg: {
        select: {
          id: true,
          hospital: { select: { name: true } },
          organisation: { select: { name: true } },
        },
      },
    },
    orderBy: { donationDate: 'desc' },
  });
};

export const OrganisationServices = {
  addVolunteer,
  updateUnregisteredVolunteerDonation,
  getOrganisationVolunteers,
  getVolunteerDonationHistory,
};
