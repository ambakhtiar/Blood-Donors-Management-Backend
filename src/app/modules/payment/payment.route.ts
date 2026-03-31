import { Router } from "express";
import { PaymentControllers } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
  "/initiate",
  auth(UserRole.USER),
  validateRequest(PaymentValidation.initiateDonationSchema),
  PaymentControllers.initiateDonation
);

router.post("/success", PaymentControllers.paymentSuccess);
router.post("/fail", PaymentControllers.paymentFail);
router.post("/cancel", PaymentControllers.paymentCancel);
router.post("/ipn", PaymentControllers.paymentIPN);

export const PaymentRoutes = router;
