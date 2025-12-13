import express from "express";
import { registerUser, loginUser, getAllUsers, updateUserStatus } from "../controllers/authController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = path.join("uploads");
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
router.post("/signup", upload.single("idFile"), (req, res, next) => {
try {
registerUser(req, res);
} catch (err) {
console.error("Signup Error:", err);
res.status(500).json({ message: "Server error during signup", err });
}
});

router.post("/login", (req, res, next) => {
try {
loginUser(req, res);
} catch (err) {
console.error("Login Error:", err);
res.status(500).json({ message: "Server error during login", err });
}
});

// Admin routes
router.get("/users", getAllUsers);
router.put("/users/:userId/status", updateUserStatus);

export default router;
