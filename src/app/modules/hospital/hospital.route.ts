import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { HospitalValidation } from './hospital.validation';
import { HospitalControllers } from './hospital.controller';
import { UserRole } from '../../../generated/prisma';

const router = express.Router();

router.post(
  '/record-donation',
  auth(UserRole.HOSPITAL),
  validateRequest(HospitalValidation.recordDonationSchema),
  HospitalControllers.recordDonation
);

router.patch(
  '/requests/:requestId',
  auth(UserRole.USER),
  validateRequest(HospitalValidation.updateRequestStatusSchema),
  HospitalControllers.updateRequestStatus
);

router.get(
  '/donation-records',
  auth(UserRole.HOSPITAL),
  HospitalControllers.getHospitalDonationRecords
);

export const HospitalRoutes = router;
