export interface IAdminPayload {
    name: string;
    email: string;
    contactNumber: string;
    password?: string;
}

export interface IChangeAdminAccess {
    accountStatus: 'ACTIVE' | 'BLOCKED';
}
