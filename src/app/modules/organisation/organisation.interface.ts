import { Gender } from '../../../generated/prisma';

export interface IAddVolunteerPayload {
  contactNumber: string;
  name?: string;
  email?: string;
  bloodGroup?: string;
  gender?: Gender;
}
