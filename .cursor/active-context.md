> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\modules\hospital\hospital.validation.ts` (Domain: **Database (Models/Schema)**)

### 🔴 Database (Models/Schema) Gotchas
- **⚠️ GOTCHA: problem-fix in post.validation.ts**: -       donationTimeType: z.nativeEnum(DonationTimeType, { required_error: 'Donation time type is required' }),
+       donationTimeType: z.nativeEnum(DonationTimeType, { message: 'Donation time type is required' }),

📌 IDE AST Context: Modified symbols likely include [BloodGroupEnum, createPostSchema, updatePostSchema]

### 📐 Database (Models/Schema) Conventions & Fixes
- **[convention] Replaced dependency bloodGrouputils — confirmed 4x**: - import { bloodGroupMap } from '../../utils/bloodGroup.utils';
+ import { bloodGroupMap } from '../../helpers/bloodGroup.utils';

📌 IDE AST Context: Modified symbols likely include [recordDonationSchema, updateRequestStatusSchema, HospitalValidation]
- **[discovery] discovery in hospital.validation.ts**: File updated (external): src/app/modules/hospital/hospital.validation.ts

Content summary (29 lines):
import { z } from 'zod';
import { Gender, RequestStatus } from '../../../generated/prisma';
import { bloodGroupMap } from '../../utils/bloodGroup.utils';

const recordDonationSchema = z.object({
  body: z.object({
    contactNumber: z.string({ message: 'contactNumber is required' }),
    name: z.string().optional(),
    bloodGroup: z.string().transform((val) => bloodGroupMap[val] || val).optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
    weight: z.number().optional(),
 
- **[discovery] discovery in hospital.service.ts**: File updated (external): src/app/modules/hospital/hospital.service.ts

Content summary (222 lines):
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { IRecordDonationPayload, IUpdateRequestStatusPayload } from './hospital.interface';
import { Gender, PostType, RequestStatus, BloodGroup } from '../../../generated/prisma';
import { sendNotificationEmail } from '../../utils/sendEmail';
import { bloodGroupMap } from '../../utils/bloodGroup.utils';

const recordDonation = async (hospitalId: string, payload: IRecord
- **[what-changed] Replaced dependency BloodGroup**: - import { DonationTimeType, PostType } from "../../../generated/prisma";
+ import { BloodGroup, DonationTimeType, PostType } from "../../../generated/prisma";

📌 IDE AST Context: Modified symbols likely include [ICreatePost, IPostFilters, IPaginationOptions]
- **[what-changed] Replaced dependency DonationTimeType**: - import { PostType } from "../../../generated/prisma";
+ import { DonationTimeType, PostType } from "../../../generated/prisma";

📌 IDE AST Context: Modified symbols likely include [ICreatePost, IPostFilters, IPaginationOptions]
- **[what-changed] 🟢 Edited src/app/modules/post/post.validation.ts (11 changes, 1min)**: Active editing session on src/app/modules/post/post.validation.ts.
11 content changes over 1 minutes.
- **[convention] problem-fix in post.validation.ts — confirmed 5x**: -       donationTimeType: z.nativeEnum(DonationTimeType, { 1, 'Donation time type is required' }),
+       donationTimeType: z.nativeEnum(DonationTimeType, { required_error: 'Donation time type is required' }),

📌 IDE AST Context: Modified symbols likely include [BloodGroupEnum, createPostSchema, updatePostSchema]
- **[what-changed] what-changed in post.validation.ts**: -       donationTimeType: z.nativeEnum(DonationTimeType, {  'Donation time type is required' }),
+       donationTimeType: z.nativeEnum(DonationTimeType, { 1, 'Donation time type is required' }),

📌 IDE AST Context: Modified symbols likely include [BloodGroupEnum, createPostSchema, updatePostSchema]
- **[what-changed] 🟢 Edited src/app/helpers/bloodGroup.utils.ts (6 changes, 1min)**: Active editing session on src/app/helpers/bloodGroup.utils.ts.
6 content changes over 1 minutes.
- **[what-changed] Updated schema BloodGroup**: - 
+ import { BloodGroup } from "../../generated/prisma";
- export const bloodGroupMap: Record<string, BloodGroup> = {
+ 
-   'A+': BloodGroup.A_POSITIVE,
+ export const bloodGroupMap: Record<string, BloodGroup> = {
-   'A-': BloodGroup.A_NEGATIVE,
+   'A+': BloodGroup.A_POSITIVE,
-   'B+': BloodGroup.B_POSITIVE,
+   'A-': BloodGroup.A_NEGATIVE,
-   'B-': BloodGroup.B_NEGATIVE,
+   'B+': BloodGroup.B_POSITIVE,
-   'AB+': BloodGroup.AB_POSITIVE,
+   'B-': BloodGroup.B_NEGATIVE,
-   'AB-': BloodGroup.AB_NEGATIVE,
+   'AB+': BloodGroup.AB_POSITIVE,
-   'O+': BloodGroup.O_POSITIVE,
+   'AB-': BloodGroup.AB_NEGATIVE,
-   'O-': BloodGroup.O_NEGATIVE,
+   'O+': BloodGroup.O_POSITIVE,
- };
+   'O-': BloodGroup.O_NEGATIVE,
- 
+ };
- export const reverseBloodGroupMap: Record<string, string> = Object.fromEntries(
+ 
-   Object.entries(bloodGroupMap).map(([k, v]) => [v, k])
+ export const reverseBloodGroupMap: Record<string, string> = Object.fromEntries(
- );
+   Object.entries(bloodGroupMap).map(([k, v]) => [v, k])
- 
+ );
- export const mapBloodGroupToEnum = (bloodGroup: string): BloodGroup => {
+ 
-   const mapped = bloodGroupMap[bloodGroup];
+ export const mapBloodGroupToEnum = (bloodGroup: string): BloodGroup => {
-   if (!mapped) {
+   const mapped = bloodGroupMap[bloodGroup];
-     throw new Error(`Invalid blood group: ${bloodGroup}`);
+   if (!mapped) {
-   }
+     throw new Error(`Invalid blood group: ${bloodGroup}`);
-   return mapped;
+   }
- };
+   return mapped;
- 
+ };
- export const mapEnumToBloodGroup = (bloodGroup: BloodGroup): string => {
+ 
-   return reverseBloodGroupMap[bloodGroup] || bloodGroup;
+ export const mapEnumToBloodGroup = (bloodGroup: BloodGroup): string => {
- };
+   return reverseBloodGroupMap[bloodGroup] || bloodGroup;
- 
+ };
+ 

📌 IDE AST Context: Modified symbols likely include [bloodGroupMap, reverseBloodGroupMap, mapBloodGroupToEnum, mapEnumToBloodGroup]
- **[convention] what-changed in bloodGroup.utils.ts — confirmed 3x**: - export const mapEnumToBloodGroup = (bloodGroup: BloodGroup\): string => {
+ export const mapEnumToBloodGroup = (bloodGroup: BloodGroup): string => {

📌 IDE AST Context: Modified symbols likely include [bloodGroupMap, reverseBloodGroupMap, mapBloodGroupToEnum, mapEnumToBloodGroup]
- **[what-changed] 🟢 Edited src/app/modules/post/post.interface.ts (59 changes, 1min)**: Active editing session on src/app/modules/post/post.interface.ts.
59 content changes over 1 minutes.
- **[what-changed] Replaced dependency Either**: - import { bloodGroupMap } from '../../utils/bloodGroup.utils';
+ import { bloodGroupMap } from '../../helpers/bloodGroup.utils';
-     .refine((data) => data.location || (data.division && data.district && data.upazila), {
+       .refine((data) => data.location || (data.division && data.district && data.upazila), {
-       message: 'Either raw location or division/district/upazila must be provided',
+         message: 'Either raw location or division/district/upazila must be provided',
-       path: ['location'],
+         path: ['location'],
-     })
+       })
-     .refine((data) => data.donationTimeType !== DonationTimeType.FIXED || data.donationTime, {
+       .refine((data) => data.donationTimeType !== DonationTimeType.FIXED || data.donationTime, {
-       message: 'Donation time is required when donationTimeType is FIXED',
+         message: 'Donation time is required when donationTimeType is FIXED',
-       path: ['donationTime'],
+         path: ['donationTime'],
-     }),
+       }),

📌 IDE AST Context: Modified symbols likely include [BloodGroupEnum, createPostSchema, updatePostSchema]
- **[convention] Strengthened types Prisma**: - import { bloodGroupMap } from "../../utils/bloodGroup.utils";
+ import { bloodGroupMap } from "../../helpers/bloodGroup.utils";
-        await tx.organisation.update({
+       await tx.organisation.update({
-     const { bloodGroup, division, district, upazila, searchTerm } = filters;
+   const { bloodGroup, division, district, upazila, searchTerm } = filters;
-     const andConditions = [];
+   const andConditions = [];
-     if (searchTerm) {
+   if (searchTerm) {
-         andConditions.push({
+     andConditions.push({
-             OR: [
+       OR: [
-                 { email: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
+         { email: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
-                 { contactNumber: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
+         { contactNumber: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } },
-                 { donorProfile: { name: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } } }
+         { donorProfile: { name: { contains: searchTerm as string, mode: Prisma.QueryMode.insensitive } } }
-             ]
+       ]
-         });
+     });
-     }
+   }
-     if (bloodGroup) {
+   if (bloodGroup) {
-         const mappedBloodGroup = bloodGroupMap[bloodGroup as string] || bloodGroup;
+     const mappedBloodGroup = bloodGroupMap[bloodGroup as string] || bloodGroup;
-         andConditions.push({
+     andConditions.push({
-             donorProfile: { bloodGroup: { equals: mappedBloodGroup as BloodGroup } }
+       donorProfile: { bloodGroup: { equals: mappedBloodGroup as BloodGroup } }
-         });
+     });
-     }
+   }
-     if (division) {
+   if (division) {
-         andConditions.push({ division: { equals: division as string } });
+     andConditions.push({ division: { equals: division as string } });
-     }
+   }
-     if (distr
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [getMyProfile, updateMyProfile, getDonorList, UserServices]
