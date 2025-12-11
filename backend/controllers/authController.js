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

  const sql = "SELECT * FROM users WHERE email = ? OR phone = ?";

  db.query(sql, [emailOrPhone, emailOrPhone], (err, data) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (data.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = data[0];

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user.id }, "secretkey");

    // ✅ Send user info along with role
    return res.json({
      message: "Login successful",
      token,
      role: user.role,       // <-- important for redirect
      userId: user.id,       // optional
      userName: user.fullName // optional
    });
  });
};
