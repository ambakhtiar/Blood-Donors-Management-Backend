import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.service';
import { IOptions, IUserFilters } from './admin.interface';
import pick from '../../shared/pick';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'email', 'contactNumber', 'role', 'accountStatus']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await AdminServices.getAllUsers(filters as IUserFilters, options as IOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllHospitals = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'email', 'contactNumber', 'accountStatus']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await AdminServices.getAllHospitals(filters as IUserFilters, options as IOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Hospitals retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllOrganisations = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'email', 'contactNumber', 'accountStatus']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await AdminServices.getAllOrganisations(filters as IUserFilters, options as IOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organisations retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const requester = req.user;

  const result = await AdminServices.changeUserStatus(id as string, status, requester);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const getSystemAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getSystemAnalytics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System analytics retrieved successfully',
    data: result,
  });
});

const updateHospitalStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const requester = req.user;
  const result = await AdminServices.updateHospitalStatus(id as string, status, requester);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Hospital account status updated successfully',
    data: result,
  });
});

const updateOrganisationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const requester = req.user;
  const result = await AdminServices.updateOrganisationStatus(id as string, status, requester);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organisation account status updated successfully',
    data: result,
  });
});

export const AdminControllers = {
  getAllUsers,
  changeUserStatus,
  getSystemAnalytics,
  getAllHospitals,
  getAllOrganisations,
  updateHospitalStatus,
  updateOrganisationStatus,
};
