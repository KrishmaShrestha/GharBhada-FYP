import express from "express";
import { 
  createProperty, 
  getProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty,
  getOwnerProperties,
  updatePropertyStatus
} from "../controllers/propertyController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = path.join("uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage setup for property photos
const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.array("photos", 5), createProperty);
router.get("/", getProperties);
router.get("/owner/:ownerId", getOwnerProperties);
router.get("/:id", getPropertyById);
router.put("/:id", upload.array("photos", 5), updateProperty);
router.put("/:id/status", updatePropertyStatus);
router.delete("/:id", deleteProperty);

export default router;