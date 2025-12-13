import db from "./config/db.js";
import bcrypt from "bcrypt";

// Create test users for development
const createTestUsers = () => {
  const hashedPassword = bcrypt.hashSync("password123", 10);
  
  let completed = 0;
  const total = 3;
  
  const checkComplete = () => {
    completed++;
    if (completed === total) {
      console.log("✅ Test users created successfully!");
      console.log("📧 Login credentials:");
      console.log("Admin: admin@gharbhada.com / password123");
      console.log("Owner: owner@test.com / password123");
      console.log("Tenant: tenant@test.com / password123");
      process.exit(0);
    }
  };
  
  // Test Admin
  db.query(`
    INSERT IGNORE INTO users (fullName, email, phone, address, role, password, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    "Admin User", 
    "admin@gharbhada.com", 
    "9812345678", 
    "Kathmandu, Nepal", 
    "Admin", 
    hashedPassword, 
    "Active"
  ], (err) => {
    if (err) console.error("Error creating admin:", err);
    checkComplete();
  });

  // Test Owner
  db.query(`
    INSERT IGNORE INTO users (fullName, email, phone, address, role, password, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    "John Owner", 
    "owner@test.com", 
    "9812345679", 
    "Baneshwor, Kathmandu", 
    "Owner", 
    hashedPassword, 
    "Active"
  ], (err) => {
    if (err) console.error("Error creating owner:", err);
    checkComplete();
  });

  // Test Tenant
  db.query(`
    INSERT IGNORE INTO users (fullName, email, phone, address, role, password, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    "Jane Tenant", 
    "tenant@test.com", 
    "9812345680", 
    "Thamel, Kathmandu", 
    "Tenant", 
    hashedPassword, 
    "Active"
  ], (err) => {
    if (err) console.error("Error creating tenant:", err);
    checkComplete();
  });
};

createTestUsers();