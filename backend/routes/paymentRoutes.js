import express from "express";
import { 
  createPayment, 
  getPayments, 
  getPaymentById, 
  updatePaymentStatus,
  getOwnerPayments,
  getTenantPayments,
  processSecurityDeposit,
  processMonthlyRent
} from "../controllers/paymentController.js";

const router = express.Router();

// Routes
router.post("/", createPayment);
router.post("/security-deposit", processSecurityDeposit);
router.post("/monthly-rent", processMonthlyRent);
router.get("/", getPayments);
router.get("/owner/:ownerId", getOwnerPayments);
router.get("/tenant/:tenantId", getTenantPayments);
router.get("/:id", getPaymentById);
router.put("/:id/status", updatePaymentStatus);

export default router;