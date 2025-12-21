const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gharbada_db'
});

// Check users in database
const checkUsers = () => {
  console.log("Checking users in database...");
  
  db.query("SELECT id, fullName, email, role, status FROM users", (err, results) => {
    if (err) {
      console.error("Error checking users:", err);
      return;
    }
    
    console.log("Users in database:");
    console.table(results);
    db.end();
  });
};

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL Database');
  checkUsers();
});