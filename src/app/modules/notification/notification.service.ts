import { Prisma } from '../../../generated/prisma';
import { prisma } from '../../lib/prisma';
import { INotificationFilters, IPaginationOptions } from './notification.interface';

const getMyNotifications = async (
    userId: string,
    filters: INotificationFilters,
    options: IPaginationOptions
) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const { searchTerm, isRead } = filters;

    const andConditions: Prisma.NotificationWhereInput[] = [
        { userId }
    ];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { message: { contains: searchTerm, mode: 'insensitive' } },
            ]
        });
    }

    if (isRead !== undefined) {
        // Handle boolean conversion if passed as string in query
        const isReadBool = typeof isRead === 'string' ? isRead === 'true' : isRead;
        andConditions.push({ isRead: isReadBool });
    }

    const whereConditions: Prisma.NotificationWhereInput = { AND: andConditions };

    const result = await prisma.notification.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const total = await prisma.notification.count({
        where: whereConditions,
    });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data: result,
    };
};

const markAsRead = async (userId: string, notificationId: string) => {
    const result = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId,
        },
        data: {
            isRead: true,
        },
    });

    return result;
};

const markAllAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });

    return result;
};

export const NotificationServices = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
