import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationServices } from './notification.service';
import pick from '../../shared/pick';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const filters = pick(req.query, ['searchTerm', 'isRead']) as any;
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as any;

    const result = await NotificationServices.getMyNotifications(user.userId, filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Notifications retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    const result = await NotificationServices.markAsRead(user.userId, id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Notification marked as read successfully',
        data: result,
    });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result = await NotificationServices.markAllAsRead(user.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All notifications marked as read successfully',
        data: result,
    });
});

export const NotificationControllers = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
