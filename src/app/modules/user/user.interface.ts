import { Gender, UserRole } from "../../../generated/prisma";

export interface ILocationUpdate {
    division?: string;
    district?: string;
    upazila?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
}

export interface IDonorUpdate extends ILocationUpdate {
    name?: string;
    bloodGroup?: string;
    gender?: Gender;
    weight?: number;
    lastDonationDate?: string | Date;
    isAvailableForDonation?: boolean;
}

export interface IHospitalUpdate extends ILocationUpdate {
    name?: string;
    registrationNumber?: string;
    address?: string;
}

export interface IOrganisationUpdate extends ILocationUpdate {
    name?: string;
    registrationNumber?: string;
    establishedYear?: string;
}

export interface IUpdateProfilePayload extends ILocationUpdate {
        email?: string;
        contactNumber?: string;
        role?: UserRole;
        profilePictureUrl?: string;
        donorProfile?: IDonorUpdate;
        hospital?: IHospitalUpdate;
        organisation?: IOrganisationUpdate;
}