import express from "express";
import { registerUser, loginUser, getAllUsers, updateUserStatus } from "../controllers/authController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/signup", upload.single("idFile"), (req, res) => {
  console.log("Signup request received");
  try {
    registerUser(req, res);
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error during signup", error: err.message });
  }
});

router.post("/login", (req, res) => {
  console.log("Login request received:", req.body);
  
  // Validate request body
  if (!req.body || !req.body.emailOrPhone || !req.body.password) {
    return res.status(400).json({ message: "Email/phone and password are required" });
  }
  
  try {
    loginUser(req, res);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login", error: err.message });
  }
});

// Admin routes
router.get("/users", (req, res) => {
  console.log("Get users request received");
  try {
    getAllUsers(req, res);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error getting users", error: err.message });
  }
});

router.put("/users/:userId/status", (req, res) => {
  console.log("Update user status request received");
  try {
    updateUserStatus(req, res);
  } catch (err) {
    console.error("Update user status error:", err);
    res.status(500).json({ message: "Server error updating user status", error: err.message });
  }
});

export default router;
