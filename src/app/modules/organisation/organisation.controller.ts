import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrganisationServices } from './organisation.service';

const addVolunteer = catchAsync(async (req: Request, res: Response) => {
    const { userId: orgId } = req.user;
    const result = await OrganisationServices.addVolunteer(orgId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Volunteer added successfully',
        data: result,
    });
});

const updateUnregisteredVolunteerDonation = catchAsync(async (req: Request, res: Response) => {
    const { userId: orgId } = req.user;
    const { bloodDonorId } = req.params;
    const { date, donationDate } = req.body;
    const finalDate = (donationDate || date) as string;

    const result = await OrganisationServices.updateUnregisteredVolunteerDonation(
        orgId as string,
        bloodDonorId as string,
        finalDate
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Volunteer donation date updated successfully',
        data: result,
    });
});

const getOrganisationVolunteers = catchAsync(async (req: Request, res: Response) => {
    const { userId: orgId } = req.user;
    const result = await OrganisationServices.getOrganisationVolunteers(orgId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Volunteers retrieved successfully',
        data: result,
    });
});

const deleteVolunteer = catchAsync(async (req: Request, res: Response) => {
    const { userId: orgId } = req.user;
    const { bloodDonorId } = req.params;

    await OrganisationServices.deleteVolunteerFromDB(orgId as string, bloodDonorId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Volunteer removed successfully',
        data: null,
    });
});

const updateUnregisteredVolunteerInfo = catchAsync(async (req: Request, res: Response) => {
    const { userId: orgId } = req.user;
    const { bloodDonorId } = req.params;

    const result = await OrganisationServices.updateUnregisteredVolunteerInfoFromDB(
        orgId as string,
        bloodDonorId as string,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Volunteer info updated successfully',
        data: result,
    });
});

export const OrganisationControllers = {
    addVolunteer,
    updateUnregisteredVolunteerDonation,
    getOrganisationVolunteers,
    deleteVolunteer,
    updateUnregisteredVolunteerInfo,
};
