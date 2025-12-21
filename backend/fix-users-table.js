const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gharbada_db'
});

// Add missing status column to users table
const fixUsersTable = () => {
  console.log("Adding status column to users table...");
  
  // First check if status column exists
  db.query("SHOW COLUMNS FROM users LIKE 'status'", (err, result) => {
    if (err) {
      console.error("Error checking columns:", err);
      return;
    }
    
    if (result.length === 0) {
      // Status column doesn't exist, add it
      db.query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('Pending', 'Active', 'Suspended') DEFAULT 'Active'
      `, (err) => {
        if (err) {
          console.error("Error adding status column:", err);
        } else {
          console.log("✅ Status column added successfully!");
          db.end();
        }
      });
    } else {
      console.log("✅ Status column already exists!");
      db.end();
    }
  });
};

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL Database');
  fixUsersTable();
});