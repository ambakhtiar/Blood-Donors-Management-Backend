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
            'This user already has a BloodLink account. Their donation dates are updated automatically when they donate. Manual updates are only for registration-free volunteers.'
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

const deleteVolunteerFromDB = async (orgId: string, bloodDonorId: string) => {
    const volunteerLink = await prisma.organisationVolunteer.findUnique({
        where: {
            organisationId_bloodDonorId: {
                organisationId: orgId,
                bloodDonorId,
            },
        },
    });

    if (!volunteerLink || volunteerLink.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, 'This volunteer is not linked to your organisation.');
    }

    return await prisma.organisationVolunteer.update({
        where: {
            organisationId_bloodDonorId: {
                organisationId: orgId,
                bloodDonorId,
            },
        },
        data: { isDeleted: true },
    });
};

const updateUnregisteredVolunteerInfoFromDB = async (
    orgId: string,
    bloodDonorId: string,
    payload: Partial<IAddVolunteerPayload>
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
        throw new AppError(httpStatus.NOT_FOUND, 'This volunteer is not linked to your organisation.');
    }

    if (volunteerLink.bloodDonor.userId !== null) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'This volunteer is a registered platform user. You can only edit info for offline/unregistered volunteers.'
        );
    }

    const mappedBloodGroup = payload.bloodGroup
        ? (bloodGroupMap[payload.bloodGroup as keyof typeof bloodGroupMap] || (payload.bloodGroup as BloodGroup))
        : undefined;

    return await prisma.bloodDonor.update({
        where: { id: bloodDonorId },
        data: {
            name: payload.name,
            bloodGroup: mappedBloodGroup as BloodGroup,
            division: payload.division || undefined,
            district: payload.district || undefined,
            upazila: payload.upazila || undefined,
            gender: payload.gender as Gender,
        },
    });
};

export const OrganisationServices = {
    addVolunteer,
    updateUnregisteredVolunteerDonation,
    getOrganisationVolunteers,
    deleteVolunteerFromDB,
    updateUnregisteredVolunteerInfoFromDB,
};
