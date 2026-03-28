import { PostType } from "../../../generated/prisma";

export interface ICreatePost {
  type: PostType;
  title?: string;
  content?: string;
  images?: string[];
  contactNumber?: string;
  location?: string;
  division?: string;
  district?: string;
  upazila?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  bloodGroup?: string;
  bloodBags?: number;
  reason?: string;
  donationTime?: string;
  hemoglobin?: number;
  medicalIssues?: string;
  targetAmount?: number;
  bkashNagadNumber?: string;
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
