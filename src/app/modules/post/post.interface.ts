import { BloodGroup, DonationTimeType, PostType } from "../../../generated/prisma";

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
  bloodGroup?: BloodGroup;
  bloodBags?: number;
  reason?: string;
  donationTimeType?: DonationTimeType;
  donationTime?: string | Date;
  hemoglobin?: number;
  medicalIssues?: string;
  targetAmount?: number;
  bkashNagadNumber?: string;
}

export interface IPostFilters {
  searchTerm?: string;
  type?: PostType;
  bloodGroup?: BloodGroup;
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
