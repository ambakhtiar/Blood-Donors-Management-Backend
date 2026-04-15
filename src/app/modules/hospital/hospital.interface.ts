export interface IHospitalDonationRecordFilters {
  bloodGroup?: string;
  donorName?: string;
  division?: string;
  district?: string;
  upazila?: string;
  searchTerm?: string;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
import { BloodGroup, Gender, RequestStatus } from '../../../generated/prisma';

export interface IRecordDonationPayload {
  contactNumber: string;
  name: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  createPost?: boolean;
  postTitle?: string;
  postImages?: string[];
  postContent?: string;
  division?: string;
  district?: string;
  upazila?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

export interface IUpdateHospitalDonationRecordPayload {
  createPost?: boolean;
  postTitle?: string;
  postImages?: string[];
  postContent?: string;
  name?: string;
  contactNumber?: string;
  division?: string;
  district?: string;
  upazila?: string;
}

export interface IUpdateRequestStatusPayload {
  status: RequestStatus;
}
