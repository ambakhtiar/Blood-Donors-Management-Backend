import { AccountStatus } from "../../../generated/prisma";

export interface IUserFilters {
  searchTerm?: string;
  email?: string;
  contactNumber?: string;
  role?: string;
  accountStatus?: AccountStatus;
}

export interface IOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
