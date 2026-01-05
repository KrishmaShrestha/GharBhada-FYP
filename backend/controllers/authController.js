import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = (req, res) => {
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

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql =
    "INSERT INTO users (fullName, email, phone, address, dob, citizenshipNumber, idFile, role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [
      fullName,
      email,
      phone,
      address,
      dob,
      citizenshipNumber,
      idFile,
      role,
      hashedPassword,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error registering user", err });

      return res.json({ message: "User registered successfully" });
    }
  );
};

export const loginUser = (req, res) => {
  const { emailOrPhone, password } = req.body;

  console.log("Login attempt:", { emailOrPhone }); // Debug log

  const sql = "SELECT * FROM users WHERE email = ? OR phone = ?";

  db.query(sql, [emailOrPhone, emailOrPhone], (err, data) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ message: "Server error" });
    }
    
    if (data.length === 0) {
      console.log("User not found:", emailOrPhone);
      return res.status(404).json({ message: "User not found" });
    }

    const user = data[0];
    console.log("User found:", { id: user.id, email: user.email, role: user.role, status: user.status });

    // Check if user is approved (not pending or suspended)
    if (user.status === 'Pending') {
      return res.status(403).json({ 
        message: "Your account is pending admin approval. Please wait for verification." 
      });
    }
    
    if (user.status === 'Suspended') {
      return res.status(403).json({ 
        message: "Your account has been suspended. Please contact support." 
      });
    }
    
    if (user.status === 'Rejected') {
      return res.status(403).json({ 
        message: "Your account application was rejected. Please contact support." 
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", { expiresIn: "24h" });

    console.log("Login successful for user:", user.email);

    // Send complete user info
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
};

// Get all users (Admin only)
export const getAllUsers = (req, res) => {
  const sql = `
    SELECT id, fullName, email, phone, address, dob, citizenshipNumber, 
           idFile, role, status, createdAt, updatedAt 
    FROM users 
    ORDER BY createdAt DESC
  `;
  
  db.query(sql, (err, users) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(users);
  });
};

// Update user status (Admin only)
export const updateUserStatus = (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body;

  const sql = "UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?";
  
  db.query(sql, [status, userId], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ message: "Server error" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User status updated successfully" });
  });
};
