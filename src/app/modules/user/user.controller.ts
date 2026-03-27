import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const result = await UserServices.getMyProfile(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const result = await UserServices.updateMyProfile(userId, role, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const getDonorList = catchAsync(async (req: Request, res: Response) => {
    const result = await UserServices.getDonorList(req.query as Record<string, unknown>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Donor list retrieved successfully",
        data: result,
    });
});

export const UserControllers = {
  getMyProfile,
  updateMyProfile,
  getDonorList,
};