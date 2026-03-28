import { BloodGroup, Gender, UserRole } from "../../../generated/prisma";


export interface ILocationInfo {
    division: string;
    district: string;
    upazila: string;
}

export interface IDonorInfo extends ILocationInfo {
    name: string;
    bloodGroup: BloodGroup;
    gender: Gender;
    weight?: number;
    lastDonationDate?: string | Date;
}

export interface IHospitalInfo extends ILocationInfo {
    name: string;
    registrationNumber?: string;
    address?: string;
}

export interface IOrganisationInfo extends ILocationInfo {
    name: string;
    registrationNumber?: string;
    establishedYear?: string;
}

export interface IRegisterUser {
    email?: string;
    contactNumber: string;
    password: string;
    role: UserRole;
    donorInfo?: IDonorInfo;
    hospitalInfo?: IHospitalInfo;
    organisationInfo?: IOrganisationInfo;
}

export interface ILoginUser {
    contactNumber?: string;
    email?: string;
    password: string;
}

export interface IChangePassword {
    oldPassword: string;
    newPassword: string;
}

export interface IForgotPassword {
    email: string;
}

export interface IResetPassword {
    id: string;
    token: string;
    newPassword: string;
}


