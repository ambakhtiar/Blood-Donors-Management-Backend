import { Gender, RequestStatus } from '../../../generated/prisma';

export interface IRecordDonationPayload {
  contactNumber: string;
  name?: string;
  bloodGroup?: string;
  gender?: Gender;
  weight?: number;
  createPost?: boolean;
  postContent?: string;
}

export interface IUpdateRequestStatusPayload {
  status: RequestStatus;
}
