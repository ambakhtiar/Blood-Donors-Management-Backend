import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import { envVars } from '../../config/env';

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.registerUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User registered successfully',
        data: result,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    const result = await AuthServices.loginUser(req.body, ipAddress as string, device as string);
    const { refreshToken, accessToken, user } = result;
    //   console.log(refreshToken, accessToken);

    res.cookie('refreshToken', refreshToken, {
        secure: envVars.NODE_ENV === 'production',
        httpOnly: true,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User logged in successfully',
        data: { user, accessToken },
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const result = await AuthServices.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Access token retrieved successfully!',
        data: result,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { ...passwordData } = req.body;

    await AuthServices.changePassword(req.user, passwordData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password changed successfully!',
        data: null,
    });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.forgotPassword(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password reset OTP sent successfully!',
        data: result,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { id, token, newPassword } = req.body;
    await AuthServices.resetPassword({ id, token, newPassword });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password reset successfully!',
        data: null,
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    await AuthServices.logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
        secure: envVars.NODE_ENV === 'production',
        httpOnly: true,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User logged out successfully!',
        data: null,
    });
});

export const AuthControllers = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
};