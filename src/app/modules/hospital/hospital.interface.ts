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
  weight?: number;
  createPost?: boolean;
  postContent?: string;
  division?: string;
  district?: string;
  upazila?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

export interface IUpdateRequestStatusPayload {
  status: RequestStatus;
}
