import mysql from "mysql2";

// Connect without specifying database to create it
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

const setupDatabase = () => {
  console.log("Setting up database...");
  
  // Create database
  connection.query("CREATE DATABASE IF NOT EXISTS gharbada_db", (err) => {
    if (err) {
      console.error("❌ Error creating database:", err);
      process.exit(1);
    }
    
    console.log("✅ Database 'gharbada_db' created/verified");
    
    // Switch to the database
    connection.query("USE gharbada_db", (err) => {
      if (err) {
        console.error("❌ Error selecting database:", err);
        process.exit(1);
      }
      
      console.log("✅ Using database 'gharbada_db'");
      
      // Create users table
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          fullName VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          address TEXT NOT NULL,
          dob DATE,
          citizenshipNumber VARCHAR(50),
          idFile VARCHAR(255),
          role ENUM('Tenant', 'Owner', 'Admin') NOT NULL,
          password VARCHAR(255) NOT NULL,
          status ENUM('Pending', 'Active', 'Suspended') DEFAULT 'Active',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createUsersTable, (err) => {
        if (err) {
          console.error("❌ Error creating users table:", err);
        } else {
          console.log("✅ Users table created/verified");
        }
        
        connection.end();
        console.log("✅ Database setup complete!");
        process.exit(0);
      });
    });
  });
};

setupDatabase();