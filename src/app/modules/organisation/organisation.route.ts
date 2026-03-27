import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrganisationValidation } from './organisation.validation';
import { OrganisationControllers } from './organisation.controller';
import { UserRole } from '../../../generated/prisma';

const router = express.Router();

router.post(
  '/volunteers',
  auth(UserRole.ORGANISATION),
  validateRequest(OrganisationValidation.addVolunteerSchema),
  OrganisationControllers.addVolunteer
);

router.patch(
  '/volunteers/:bloodDonorId/donation-date',
  auth(UserRole.ORGANISATION),
  validateRequest(OrganisationValidation.updateDonationDateSchema),
  OrganisationControllers.updateUnregisteredVolunteerDonation
);

router.get(
  '/volunteers',
  auth(UserRole.ORGANISATION),
  OrganisationControllers.getOrganisationVolunteers
);

router.get(
  '/volunteers/history',
  auth(UserRole.ORGANISATION),
  OrganisationControllers.getVolunteerDonationHistory
);

export const OrganisationRoutes = router;
