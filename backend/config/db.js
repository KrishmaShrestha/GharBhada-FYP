import mysql from "mysql2";

// Create connection for callbacks (for existing code)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gharbhada_db",
});

// Create promise connection for async/await
const dbPromise = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gharbhada_db",
}).promise();

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

// Export both versions
export default db;
export { dbPromise };
