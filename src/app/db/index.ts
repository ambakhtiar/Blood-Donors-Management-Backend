import { envVars } from '../config/env';
import { UserRole, AccountStatus } from '../../generated/prisma';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';


const superUser = {
    email: envVars.SUPER_ADMIN.EMAIL,
    contactNumber: envVars.SUPER_ADMIN.CONTACT_NUMBER,
    password: envVars.SUPER_ADMIN.PASSWORD,
    role: UserRole.SUPER_ADMIN,
    accountStatus: AccountStatus.ACTIVE,
    needsPasswordChange: false,
};

const seedSuperAdmin = async () => {
    const isExistSuperAdmin = await prisma.user.findFirst({
        where: { role: UserRole.SUPER_ADMIN },
    });

    if (!isExistSuperAdmin) {
        const hashedPassword = await bcrypt.hash(superUser.password as string, Number(envVars.BCRYPT_SALT_ROUNDS));

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: superUser.email,
                    contactNumber: superUser.contactNumber,
                    password: hashedPassword,
                    role: superUser.role,
                    accountStatus: superUser.accountStatus,
                    division: "Dhaka",
                    district: "Dhaka",
                    upazila: "Dhanmondi",
                },
            });

            await tx.superAdmin.create({
                data: { userId: user.id, name: 'System Super Admin' },
            });
        });
        console.log('✔ Super Admin seeded successfully!');
    }
};

// export default seedSuperAdmin;
seedSuperAdmin();