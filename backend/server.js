import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

console.log("🚀 Initializing GharBhada Server...");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ensure uploads folder exists
const uploadFolder = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

console.log("✅ Middleware configured");

// AUTH ROUTES
app.post("/api/auth/login", (req, res) => {
  console.log("🔐 Login request received:", req.body);
  
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    console.log("❌ Missing credentials");
    return res.status(400).json({ message: "Email/phone and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? OR phone = ?";

  db.query(sql, [emailOrPhone, emailOrPhone], (err, data) => {
    if (err) {
      console.error("❌ Database error during login:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    if (data.length === 0) {
      console.log("❌ User not found:", emailOrPhone);
      return res.status(404).json({ message: "User not found" });
    }

    const user = data[0];
    console.log("✅ User found:", { id: user.id, email: user.email, role: user.role, status: user.status });

    // Check user status
    if (user.status === 'Pending') {
      console.log("⏳ User pending approval");
      return res.status(403).json({ 
        message: "Your account is pending admin approval. Please wait for verification." 
      });
    }
    
    if (user.status === 'Suspended') {
      console.log("🚫 User suspended");
      return res.status(403).json({ 
        message: "Your account has been suspended. Please contact support." 
      });
    }
    
    if (user.status === 'Rejected') {
      console.log("❌ User rejected");
      return res.status(403).json({ 
        message: "Your account application was rejected. Please contact support." 
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", { expiresIn: "24h" });

    console.log("✅ Login successful for user:", user.email);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  });
});

// FORGOT PASSWORD ROUTES
app.post("/api/auth/forgot-password/verify", (req, res) => {
  console.log("🔍 Forgot password verification request received");
  
  const { method, contact } = req.body;

  if (!method || !contact) {
    console.log("❌ Missing method or contact");
    return res.status(400).json({ message: "Method and contact are required" });
  }

  // Check if user exists
  const sql = method === 'email' 
    ? "SELECT id, fullName, email FROM users WHERE email = ?" 
    : "SELECT id, fullName, phone FROM users WHERE phone = ?";

  db.query(sql, [contact], (err, data) => {
    if (err) {
      console.error("❌ Database error during forgot password:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    if (data.length === 0) {
      console.log("❌ User not found for forgot password:", contact);
      return res.status(404).json({ message: "User not found with this " + method });
    }

    const user = data[0];
    console.log("✅ User found for password reset:", { id: user.id, contact });

    // For demo purposes, we'll use fixed verification codes
    // In production, you would generate random codes and store them with expiration
    const verificationCode = method === 'email' ? '123456' : '654321';
    
    console.log(`📧 Verification code sent via ${method}: ${verificationCode}`);

    return res.json({
      message: `Verification code sent to your ${method}`,
      success: true,
      userId: user.id // We'll need this for the reset step
    });
  });
});

app.post("/api/auth/forgot-password/verify-code", (req, res) => {
  console.log("🔐 Verification code check request received");
  
  const { method, code } = req.body;

  if (!method || !code) {
    console.log("❌ Missing method or code");
    return res.status(400).json({ message: "Method and code are required" });
  }

  // Demo verification codes
  const validCodes = {
    email: '123456',
    sms: '654321'
  };

  if (code !== validCodes[method]) {
    console.log("❌ Invalid verification code:", code);
    return res.status(400).json({ message: "Invalid verification code" });
  }

  console.log("✅ Verification code validated successfully");
  return res.json({
    message: "Verification code is valid",
    success: true
  });
});

app.post("/api/auth/forgot-password/reset", (req, res) => {
  console.log("🔄 Password reset request received");
  
  const { method, contact, newPassword } = req.body;

  if (!method || !contact || !newPassword) {
    console.log("❌ Missing required fields for password reset");
    return res.status(400).json({ message: "Method, contact, and new password are required" });
  }

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  // Update password in database
  const sql = method === 'email' 
    ? "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?" 
    : "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE phone = ?";

  db.query(sql, [hashedPassword, contact], (err, result) => {
    if (err) {
      console.error("❌ Error updating password:", err);
      return res.status(500).json({ message: "Error updating password" });
    }
    
    if (result.affectedRows === 0) {
      console.log("❌ User not found for password update:", contact);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("✅ Password updated successfully for:", contact);
    return res.json({
      message: "Password updated successfully",
      success: true
    });
  });
});

app.post("/api/auth/signup", upload.single("idFile"), (req, res) => {
  console.log("📝 Signup request received");
  
  const {
    fullName,
    email,
    phone,
    address,
    dob,
    citizenshipNumber,
    role,
    password,
  } = req.body;

  const idFile = req.file ? req.file.filename : null;

  if (!fullName || !email || !password || !role) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ message: "Required fields missing" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `
    INSERT INTO users (fullName, email, phone, address, dob, citizenshipNumber, idFile, role, password) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    fullName,
    email,
    phone,
    address,
    dob,
    citizenshipNumber,
    idFile,
    role,
    hashedPassword,
  ], (err, result) => {
    if (err) {
      console.error("❌ Error registering user:", err);
      return res.status(500).json({ message: "Error registering user" });
    }

    console.log("✅ User registered successfully:", email);
    return res.json({ message: "User registered successfully" });
  });
});

app.get("/api/auth/users", (req, res) => {
  console.log("👥 Get users request received");
  
  const sql = `
    SELECT id, fullName, email, phone, address, dob, citizenshipNumber, 
           idFile, role, status, createdAt, updatedAt 
    FROM users 
    ORDER BY createdAt DESC
  `;
  
  db.query(sql, (err, users) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ message: "Server error" });
    }
    console.log(`✅ Returning ${users.length} users`);
    res.json(users);
  });
});

app.put("/api/auth/users/:userId/status", (req, res) => {
  console.log("🔄 Update user status request received");
  
  const { userId } = req.params;
  const { status, reason } = req.body;

  const sql = "UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?";
  
  db.query(sql, [status, userId], (err, result) => {
    if (err) {
      console.error("❌ Error updating user status:", err);
      return res.status(500).json({ message: "Server error" });
    }
    
    if (result.affectedRows === 0) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`✅ User ${userId} status updated to ${status}`);
    res.json({ message: "User status updated successfully" });
  });
});

// PROPERTY ROUTES
app.get("/api/properties", (req, res) => {
  console.log("🏠 Get properties request");
  
  const sql = `
    SELECT p.*, u.fullName as ownerName 
    FROM properties p 
    JOIN users u ON p.ownerId = u.id 
    WHERE p.status = 'Active'
    ORDER BY p.createdAt DESC
  `;
  
  db.query(sql, (err, properties) => {
    if (err) {
      console.error("❌ Error fetching properties:", err);
      return res.json([]);
    }
    console.log(`✅ Returning ${properties.length} properties`);
    res.json(properties);
  });
});

// BOOKING ROUTES
app.get("/api/bookings", (req, res) => {
  console.log("📋 Get all bookings request");
  res.json([]);
});

app.get("/api/bookings/tenant/:tenantId", (req, res) => {
  console.log("📋 Get tenant bookings request");
  res.json([]);
});

app.get("/api/bookings/owner/:ownerId", (req, res) => {
  console.log("📋 Get owner bookings request");
  res.json([]);
});

// PAYMENT ROUTES
app.get("/api/payments", (req, res) => {
  console.log("💳 Get all payments request");
  res.json([]);
});

app.get("/api/payments/tenant/:tenantId", (req, res) => {
  console.log("💳 Get tenant payments request");
  res.json([]);
});

app.get("/api/payments/owner/:ownerId", (req, res) => {
  console.log("💳 Get owner payments request");
  res.json([]);
});

// ADMIN ROUTES
app.get("/api/admin/users", (req, res) => {
  console.log("👑 Admin get all users request");
  
  const query = `
    SELECT id, fullName, email, phone, role, status, createdAt 
    FROM users 
    ORDER BY createdAt DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ message: "Error fetching users" });
    }
    
    console.log(`✅ Found ${results.length} users`);
    res.json(results);
  });
});

app.put("/api/admin/users/:userId/:action", (req, res) => {
  console.log(`👑 Admin ${req.params.action} user request for user ${req.params.userId}`);
  
  const { userId, action } = req.params;
  const { reason } = req.body;
  
  let status;
  switch (action) {
    case 'approve':
      status = 'Active';
      break;
    case 'reject':
      status = 'Rejected';
      break;
    case 'suspend':
      status = 'Suspended';
      break;
    case 'activate':
      status = 'Active';
      break;
    default:
      return res.status(400).json({ message: "Invalid action" });
  }
  
  const query = "UPDATE users SET status = ? WHERE id = ?";
  
  db.query(query, [status, userId], (err, result) => {
    if (err) {
      console.error(`❌ Error ${action}ing user:`, err);
      return res.status(500).json({ message: `Error ${action}ing user` });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`✅ User ${action}ed successfully`);
    res.json({ message: `User ${action}ed successfully` });
  });
});

app.put("/api/admin/properties/:propertyId/:action", (req, res) => {
  console.log(`👑 Admin ${req.params.action} property request for property ${req.params.propertyId}`);
  
  const { propertyId, action } = req.params;
  
  let status;
  switch (action) {
    case 'approve':
      status = 'Active';
      break;
    case 'reject':
      status = 'Rejected';
      break;
    case 'deactivate':
      status = 'Inactive';
      break;
    case 'activate':
      status = 'Active';
      break;
    default:
      return res.status(400).json({ message: "Invalid action" });
  }
  
  const query = "UPDATE properties SET status = ? WHERE id = ?";
  
  db.query(query, [status, propertyId], (err, result) => {
    if (err) {
      console.error(`❌ Error ${action}ing property:`, err);
      return res.status(500).json({ message: `Error ${action}ing property` });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    console.log(`✅ Property ${action}ed successfully`);
    res.json({ message: `Property ${action}ed successfully` });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// 404 handler
app.use((req, res) => {
  console.log("❓ 404 - Route not found:", req.path);
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5005;

console.log("🌐 Starting server...");

app.listen(PORT, () => {
  console.log(`\n🎉 GharBhada Backend Server Successfully Started!`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`📁 Static Files: http://localhost:${PORT}/uploads`);
  console.log(`🔑 Admin Login: admin@gharbhada.com / password123`);
  console.log(`🏠 Owner Login: owner@test.com / password123`);
  console.log(`🏡 Tenant Login: tenant@test.com / password123`);
  console.log(`📊 Database: Connected to gharbhada_db`);
  console.log(`✅ Ready for requests!\n`);
});