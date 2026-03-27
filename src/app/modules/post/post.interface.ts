import { PostType } from "../../../generated/prisma";

export interface ICreatePost {
  type: PostType;
  content: string;
  images?: string[];
  bloodGroup?: string;
  division?: string;
  district?: string;
  upazila?: string;
  requiredDate?: Date;
  targetAmount?: number;
}

export interface IPostFilters {
  searchTerm?: string;
  type?: PostType;
  bloodGroup?: string;
  division?: string;
  district?: string;
  upazila?: string;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
