import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HospitalServices } from './hospital.service';
import { IHospitalDonationRecordFilters, IPaginationOptions } from './hospital.interface';
import pick from '../../shared/pick';

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
    const filters = pick(req.query, ['searchTerm', 'donorName', 'bloodGroup', 'division', 'district', 'upazila']) as IHospitalDonationRecordFilters;
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;

    const result = await HospitalServices.getHospitalDonationRecords(hospitalId, filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Donation records retrieved successfully',
        data: result,
    });
});

const updateHospitalDonationRecord = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId: hospitalId } = req.user;
    const result = await HospitalServices.updateHospitalDonationRecord(hospitalId as string, id as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Donation record updated successfully',
        data: result,
    });
});

const deleteHospitalDonationRecord = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId: hospitalId } = req.user;
    const result = await HospitalServices.deleteHospitalDonationRecord(hospitalId as string, id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Donation record deleted successfully',
        data: result,
    });
});

export const HospitalControllers = {
    recordDonation,
    updateRequestStatus,
    getHospitalDonationRecords,
    updateHospitalDonationRecord,
    deleteHospitalDonationRecord,
};
