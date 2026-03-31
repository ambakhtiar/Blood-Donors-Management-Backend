> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\modules\Auth\auth.service.ts` (Domain: **Database (Models/Schema)**)

### 🔴 Database (Models/Schema) Gotchas
- **⚠️ GOTCHA: Fixed null crash in JwtPayload — uses a proper password hashing algorithm**: -   const decodedAccessToken = jwt.decode(accessToken) as jwt.JwtPayload;
+   return {
-   console.log('[AUTH REFRESH] New access token created.');
+     accessToken,
-   console.log('New Token Expired At:', new Date((decodedAccessToken.exp as number) * 1000).toISOString());
+   };
- 
+ };
-   return {
+ 
-     accessToken,
+ const change[REDACTED] (userData: jwt.JwtPayload, payload: IChangePassword) => {
-   };
+   const user = await prisma.user.findUnique({
- };
+     where: {
- 
+       id: userData.userId,
- const change[REDACTED] (userData: jwt.JwtPayload, payload: IChangePassword) => {
+       isDeleted: false,
-   const user = await prisma.user.findUnique({
+     },
-     where: {
+   });
-       id: userData.userId,
+ 
-       isDeleted: false,
+   if (!user) {
-     },
+     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
-   });
+   }
-   if (!user) {
+   if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
-     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
+     throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
-   if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
+   if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
-     throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
+     throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
-   if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
+   const newHashed[REDACTED] bcrypt.hash(
-     throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
+     payload.newPassword,
-   }
+     Number(envVars.BCRYPT_SALT_ROUNDS),
- 
+   );
-   const newHashed[REDACTED] bcrypt.hash(
+ 
-     payload.newPassword,
+   await prisma.user.update({
-     Number(envVars.BCRYPT_SALT_ROUNDS),
+     where: {
-   );
+       id: userData.userId,
- 
+     },
-   await prisma.user.update({
+     data: {
-     wh
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [registerUser, loginUser, refreshToken, changePassword, forgotPassword]
- **⚠️ GOTCHA: Fixed null crash in JwtPayload — uses a proper password hashing algorithm**: -   const decodedAccessToken = jwt.decode(accessToken) as jwt.JwtPayload;
+   return {
-   console.log('[AUTH REFRESH] New access token created.');
+     accessToken,
-   console.log('New Token Expired At:', new Date((decodedAccessToken.exp as number) * 1000).toISOString());
+   };
- 
+ };
-   return {
+ 
-     accessToken,
+ const change[REDACTED] (userData: jwt.JwtPayload, payload: IChangePassword) => {
-   };
+   const user = await prisma.user.findUnique({
- };
+     where: {
- 
+       id: userData.userId,
- const change[REDACTED] (userData: jwt.JwtPayload, payload: IChangePassword) => {
+       isDeleted: false,
-   const user = await prisma.user.findUnique({
+     },
-     where: {
+   });
-       id: userData.userId,
+ 
-       isDeleted: false,
+   if (!user) {
-     },
+     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
-   });
+   }
-   if (!user) {
+   if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
-     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
+     throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
-   if (user.accountStatus === 'BLOCKED' || user.accountStatus === 'REJECTED') {
+   if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
-     throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
+     throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
-   if (!(await bcrypt.compare(payload.oldPassword, user.password as string))) {
+   const newHashed[REDACTED] bcrypt.hash(
-     throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
+     payload.newPassword,
-   }
+     Number(envVars.BCRYPT_SALT_ROUNDS),
- 
+   );
-   const newHashed[REDACTED] bcrypt.hash(
+ 
-     payload.newPassword,
+   await prisma.user.update({
-     Number(envVars.BCRYPT_SALT_ROUNDS),
+     where: {
-   );
+       id: userData.userId,
- 
+     },
-   await prisma.user.update({
+     data: {
-     wh
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [registerUser, loginUser, refreshToken, changePassword, forgotPassword]
- **⚠️ GOTCHA: Added JWT tokens authentication**: -     andConditions.push({
+     const searchBg = bloodGroupMap[searchTerm as keyof typeof bloodGroupMap];
-       OR: [
+     andConditions.push({
-         { email: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
+       OR: [
-         { contactNumber: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
+         { email: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
-         { donorProfile: { name: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } } }
+         { contactNumber: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
-       ]
+         { donorProfile: { name: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } } },
-     });
+         ...(searchBg ? [{ donorProfile: { bloodGroup: { equals: searchBg } } }] : []),
-   }
+       ]
- 
+     });
-   if (bg) {
+   }
-     const bloodGroupValue = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;
+ 
-     andConditions.push({
+   if (bg) {
-       donorProfile: { bloodGroup: { equals: bloodGroupValue as BloodGroup } }
+     const bloodGroupValue = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;
-     });
+     andConditions.push({
-   }
+       donorProfile: { bloodGroup: { equals: bloodGroupValue as BloodGroup } }
- 
+     });
-   if (division) {
+   }
-     andConditions.push({ division: { equals: division as string } });
+ 
-   }
+   if (division) {
- 
+     andConditions.push({ division: { equals: division as string } });
-   if (district) {
+   }
-     andConditions.push({ district: { equals: district as string } });
+ 
-   }
+   if (district) {
- 
+     andConditions.push({ district: { equals: district as string } });
-   if (upazila) {
+   }
-     andConditions.push({ upazila: { equals: upazila as string } });
+ 
-   }
+   if (upaz
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [getMyProfile, updateMyProfile, getDonorList, getDonationHistory, UserServices]
- **⚠️ GOTCHA: Added JWT tokens authentication**: -     const bloodGroup = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;
+     const bloodGroupValue = bg ? (bloodGroupMap[bg as keyof typeof bloodGroupMap] || (bg as BloodGroup)) : undefined;
-     console.log(bg, bloodGroup);
+     andConditions.push({
-     andConditions.push({
+       donorProfile: { bloodGroup: { equals: bloodGroupValue as BloodGroup } }
-       donorProfile: { bloodGroup: { equals: bloodGroup as BloodGroup } }
+     });
-     });
+   }
-   }
+ 
- 
+   if (division) {
-   if (division) {
+     andConditions.push({ division: { equals: division as string } });
-     andConditions.push({ division: { equals: division as string } });
+   }
-   }
+ 
- 
+   if (district) {
-   if (district) {
+     andConditions.push({ district: { equals: district as string } });
-     andConditions.push({ district: { equals: district as string } });
+   }
-   }
+ 
- 
+   if (upazila) {
-   if (upazila) {
+     andConditions.push({ upazila: { equals: upazila as string } });
-     andConditions.push({ upazila: { equals: upazila as string } });
+   }
-   }
+ 
- 
+   // Always filter for USER role and not deleted
-   // Always filter for USER role and not deleted
+   andConditions.push({
-   andConditions.push({
+     role: UserRole.USER,
-     role: UserRole.USER,
+     isDeleted: false,
-     isDeleted: false,
+     donorProfile: {
-     donorProfile: {
+       isAvailableForDonation: true,
-       isAvailableForDonation: true,
+       isDeleted: false
-       isDeleted: false
+     }
-     }
+   });
-   });
+ 
- 
+   const whereConditions: Prisma.UserWhereInput = { AND: andConditions };
-   const whereConditions: Prisma.UserWhereInput = { AND: andConditions };
+ 
- 
+   const result = await prisma.user.findMany({
-   const result = await prisma.user.findMany({
+     where: whereConditions,
-     where: whereConditions,
+     include: {
-     include: {
+       
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [getMyProfile, updateMyProfile, getDonorList, getDonationHistory, UserServices]

### 📐 Database (Models/Schema) Conventions & Fixes
- **[problem-fix] Fixed null crash in Notify — uses a proper password hashing algorithm**: -   // eslint-disable-next-line @typescript-eslint/no-unused-vars
+   // Notify Admins/Super Admins if a Hospital or Organisation registers
-   const { [REDACTED] ...userWithoutPassword } = result;
+   if (role === UserRole.HOSPITAL || role === UserRole.ORGANISATION) {
-   return userWithoutPassword;
+     const admins = await prisma.user.findMany({
- };
+       where: {
- 
+         role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
- const loginUser = async (payload: ILoginUser, ipAddress: string, device: string) => {
+         isDeleted: false,
-   const { contactNumber, email, password } = payload;
+       },
- 
+       select: { id: true, email: true },
-   const user = await prisma.user.findFirst({
+     });
-     where: {
+ 
-       OR: [
+     const entityName = role === UserRole.HOSPITAL ? hospitalInfo?.name : organisationInfo?.name;
-         ...(contactNumber ? [{ contactNumber }] : []),
+     const title = `New ${role} Registration Alert`;
-         ...(email ? [{ email }] : []),
+     const message = `A new ${role.toLowerCase()} named "${entityName}" has registered and is pending approval. Please review and take action.`;
-       ],
+ 
-     },
+     // Import email utility within the scope to avoid circular dependencies if any
-   });
+     const { sendNotificationEmail } = await import('../../utils/sendEmail');
-   if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
+     // Create In-App Notifications and Send Emails
-   if (user.isDeleted) throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
+     const notificationPromises = admins.map(async (admin) => {
- 
+       // In-App Notification
-   if (user.accountStatus === 'BLOCKED') {
+       await prisma.notification.create({
-     throw new AppError(
+         data: {
-       httpStatus.FORBIDDEN,
+           userId: admin.id,
-       'Your account has been blocked by the administration due to policy violations. Please contact support.',
+           title,
-  
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [registerUser, loginUser, refreshToken, changePassword, forgotPassword]
- **[discovery] discovery in auth.service.ts**: File updated (external): src/app/modules/auth/auth.service.ts

Content summary (447 lines):
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { envVars } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { AccountStatus, Gender, UserRole } from '../../../generated/prisma';
import { sendOTPEmail } from '../../utils/sendEmail';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { bloodGroupMap } from '../../helpers/bloodGroup';
import {
  IC
- **[convention] discovery in auth.service.ts — confirmed 3x**: File updated (external): src/app/modules/auth/auth.service.ts

Content summary (413 lines):
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { envVars } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { AccountStatus, Gender, UserRole } from '../../../generated/prisma';
import { sendOTPEmail } from '../../utils/sendEmail';
import { createToken, verifyToken } from '../../utils/jwt.utils';
import { bloodGroupMap } from '../../helpers/bloodGroup';
import {
  IC
- **[what-changed] what-changed in admin.controller.ts**: -   const result = await AdminServices.approveHospital(id);
+   const result = await AdminServices.approveHospital(id as string);
-   const result = await AdminServices.approveOrganisation(id);
+   const result = await AdminServices.approveOrganisation(id as string);

📌 IDE AST Context: Modified symbols likely include [getAllUsers, getAllHospitals, getAllOrganisations, changeUserStatus, getSystemAnalytics]
- **[what-changed] Updated API endpoint Request**: - export const AdminControllers = {
+ const approveHospital = catchAsync(async (req: Request, res: Response) => {
-   getAllUsers,
+   const { id } = req.params;
-   changeUserStatus,
+   const result = await AdminServices.approveHospital(id);
-   getSystemAnalytics,
+ 
-   getAllHospitals,
+   sendResponse(res, {
-   getAllOrganisations,
+     statusCode: httpStatus.OK,
-   approveHospital,
+     success: true,
-   approveOrganisation,
+     message: 'Hospital account approved successfully',
- };
+     data: result,
- 
+   });
+ });
+ 
+ const approveOrganisation = catchAsync(async (req: Request, res: Response) => {
+   const { id } = req.params;
+   const result = await AdminServices.approveOrganisation(id);
+ 
+   sendResponse(res, {
+     statusCode: httpStatus.OK,
+     success: true,
+     message: 'Organisation account approved successfully',
+     data: result,
+   });
+ });
+ 
+ export const AdminControllers = {
+   getAllUsers,
+   changeUserStatus,
+   getSystemAnalytics,
+   getAllHospitals,
+   getAllOrganisations,
+   approveHospital,
+   approveOrganisation,
+ };
+ 

📌 IDE AST Context: Modified symbols likely include [getAllUsers, getAllHospitals, getAllOrganisations, changeUserStatus, getSystemAnalytics]
- **[discovery] discovery in admin.controller.ts**: File updated (external): src/app/modules/admin/admin.controller.ts

Content summary (88 lines):
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.service';
import { IOptions, IUserFilters } from './admin.interface';
import pick from '../../shared/pick';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'email', 'contactNumber', 'role', 'accountStat
- **[what-changed] what-changed in server.ts**: -     await seedSuperAdmin();
+     // await seedSuperAdmin();

📌 IDE AST Context: Modified symbols likely include [PORT, server]
- **[what-changed] what-changed in server.ts**: -     // await seedSuperAdmin();
+     await seedSuperAdmin();

📌 IDE AST Context: Modified symbols likely include [PORT, server]
- **[what-changed] 🟢 Edited src/app/modules/user/user.controller.ts (5 changes, 103min)**: Active editing session on src/app/modules/user/user.controller.ts.
5 content changes over 103 minutes.
- **[problem-fix] problem-fix in organisation.service.ts**: File updated (external): src/app/modules/organisation/organisation.service.ts

Content summary (164 lines):
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { IAddVolunteerPayload } from './organisation.interface';
import { Gender, RequestStatus, BloodGroup } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const addVolunteer = async (orgId: string, payload: IAddVolunteerPayload) => {
  const bloodDonor = await prisma.bloodDonor.findUnique({
    where: { contactNumber: paylo
- **[convention] discovery in hospital.service.ts — confirmed 3x**: File updated (external): src/app/modules/hospital/hospital.service.ts

Content summary (222 lines):
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { IRecordDonationPayload, IUpdateRequestStatusPayload } from './hospital.interface';
import { Gender, PostType, RequestStatus, BloodGroup } from '../../../generated/prisma';
import { sendNotificationEmail } from '../../utils/sendEmail';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const recordDonation = async (hospitalId: string, payload: IRecordDona
