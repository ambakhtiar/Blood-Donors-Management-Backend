import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HospitalServices } from './hospital.service';

const recordDonation = catchAsync(async (req: Request, res: Response) => {
  const { userId: hospitalId } = req.user;
  const result = await HospitalServices.recordDonation(hospitalId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Donation recorded successfully',
    data: result,
  });
});

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { userId } = req.user;
  const result = await HospitalServices.updateRequestStatus(
    userId as string,
    requestId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request status updated successfully',
    data: result,
  });
});

const getHospitalDonationRecords = catchAsync(async (req: Request, res: Response) => {
  const { userId: hospitalId } = req.user;
  const result = await HospitalServices.getHospitalDonationRecords(hospitalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Donation records retrieved successfully',
    data: result,
  });
});

export const HospitalControllers = {
  recordDonation,
  updateRequestStatus,
  getHospitalDonationRecords,
};
