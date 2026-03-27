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
  const { date } = req.body;
  const result = await OrganisationServices.updateUnregisteredVolunteerDonation(
    orgId as string,
    bloodDonorId as string,
    date as string
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

const getVolunteerDonationHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId: orgId } = req.user;
  const result = await OrganisationServices.getVolunteerDonationHistory(orgId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Volunteer donation history retrieved successfully',
    data: result,
  });
});

export const OrganisationControllers = {
  addVolunteer,
  updateUnregisteredVolunteerDonation,
  getOrganisationVolunteers,
  getVolunteerDonationHistory,
};
