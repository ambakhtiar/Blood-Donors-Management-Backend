import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ManageAdminServices } from './manageAdmin.service';

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageAdminServices.createAdmin(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Admin created successfully!',
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageAdminServices.getAllAdmins(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admins retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ManageAdminServices.getSingleAdmin(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin retrieved successfully!',
    data: result,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ManageAdminServices.updateAdmin(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin updated successfully!',
    data: result,
  });
});

const changeAdminAccess = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const requester = req.user;
  const result = await ManageAdminServices.changeAdminAccess(id, req.body, requester);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin access changed successfully!',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const requester = req.user;
  const result = await ManageAdminServices.deleteAdmin(id, requester);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin deleted successfully!',
    data: result,
  });
});

export const ManageAdminControllers = {
  createAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  changeAdminAccess,
  deleteAdmin,
};
