import db from "./config/db.js";

const checkUsers = () => {
  console.log("Checking database connection...");
  
  // Check if users table exists and has data
  db.query("SELECT id, fullName, email, role, status FROM users", (err, users) => {
    if (err) {
      console.error("❌ Database error:", err);
    } else {
      console.log("Users in database:");
      console.table(users);
      
      if (users.length === 0) {
        console.log("❌ No users found in database!");
      } else {
        console.log(`✅ Found ${users.length} users in database`);
      }
    }
    process.exit(0);
  });
};

checkUsers();