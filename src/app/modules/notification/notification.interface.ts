export type INotificationFilters = {
    searchTerm?: string;
    isRead?: boolean;
};

export type IPaginationOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};
