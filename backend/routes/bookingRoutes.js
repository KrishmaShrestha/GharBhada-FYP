import express from "express";
import { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus,
  submitLeaseTerms,
  approveLeaseTerms,
  rejectBooking,
  approveAgreement,
  declineAgreement,
  getOwnerBookings,
  getTenantBookings
} from "../controllers/bookingController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = path.join("uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage setup for ID documents
const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("idDocument"), createBooking);
router.get("/", getBookings);
router.get("/owner/:ownerId", getOwnerBookings);
router.get("/tenant/:tenantId", getTenantBookings);
router.get("/:id", getBookingById);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/lease-terms", submitLeaseTerms);
router.put("/:id/approve-lease", approveLeaseTerms);
router.put("/:id/reject", rejectBooking);
router.put("/:id/approve-agreement", approveAgreement);
router.put("/:id/decline-agreement", declineAgreement);

export default router;