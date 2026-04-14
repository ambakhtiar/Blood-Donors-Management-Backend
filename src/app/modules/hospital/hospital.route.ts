import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { HospitalValidation } from './hospital.validation';
import { HospitalControllers } from './hospital.controller';
import { UserRole } from '../../../generated/prisma';

const router = express.Router();

router.post(
    '/donation-records',
    auth(UserRole.HOSPITAL),
    validateRequest(HospitalValidation.recordDonationSchema),
    HospitalControllers.recordDonation
);

router.patch(
    '/requests/:requestId',
    auth(UserRole.USER),
    validateRequest(HospitalValidation.updateDonationRecordSchema),
    HospitalControllers.updateRequestStatus
);

router.get(
    '/donation-records',
    auth(UserRole.HOSPITAL),
    HospitalControllers.getHospitalDonationRecords
);

router.patch(
    '/donation-records/:id',
    auth(UserRole.HOSPITAL),
    validateRequest(HospitalValidation.updateDonationRecordSchema),
    HospitalControllers.updateHospitalDonationRecord
);

router.delete(
    '/donation-records/:id',
    auth(UserRole.HOSPITAL),
    HospitalControllers.deleteHospitalDonationRecord
);

export const HospitalRoutes = router;
