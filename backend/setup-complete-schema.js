import db from "./config/db.js";

const setupCompleteSchema = () => {
  console.log("Setting up complete database schema...");
  
  // Create properties table
  const createPropertiesTable = `
    CREATE TABLE IF NOT EXISTS properties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      type ENUM('House', 'Apartment', 'Room', 'Studio') NOT NULL,
      bhk ENUM('1BHK', '2BHK', '3BHK', '4BHK+') NOT NULL,
      rent DECIMAL(10, 2) NOT NULL,
      deposit DECIMAL(10, 2) NOT NULL,
      furnishing ENUM('Furnished', 'Semi-Furnished', 'Unfurnished') NOT NULL,
      amenities TEXT,
      rules TEXT,
      photos JSON,
      ownerId INT NOT NULL,
      status ENUM('Pending', 'Active', 'Inactive', 'Rejected') DEFAULT 'Pending',
      verified BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // Create bookings table
  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      propertyId INT NOT NULL,
      tenantId INT NOT NULL,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      currentAddress TEXT NOT NULL,
      occupation VARCHAR(255) NOT NULL,
      monthlyIncome DECIMAL(10, 2) NOT NULL,
      emergencyContactName VARCHAR(255) NOT NULL,
      emergencyContactPhone VARCHAR(20) NOT NULL,
      moveInDate DATE NOT NULL,
      familySize VARCHAR(50) NOT NULL,
      hasChildren BOOLEAN DEFAULT FALSE,
      hasPets BOOLEAN DEFAULT FALSE,
      additionalNotes TEXT,
      idDocument VARCHAR(255),
      status ENUM('Pending Owner Approval', 'Approved', 'Rejected', 'Lease Terms Submitted', 'Lease Terms Approved', 'Agreement Pending', 'Agreement Approved', 'Agreement Declined', 'Payment Completed', 'Active', 'Terminated') DEFAULT 'Pending Owner Approval',
      leaseDuration VARCHAR(50),
      leaseStartDate DATE,
      leaseEndDate DATE,
      additionalTerms TEXT,
      rejectionReason TEXT,
      agreementDate TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (tenantId) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // Create payments table
  const createPaymentsTable = `
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bookingId INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      paymentMethod ENUM('eSewa', 'Khalti', 'Bank Transfer', 'Credit Card') NOT NULL,
      transactionId VARCHAR(255) UNIQUE NOT NULL,
      paymentType ENUM('Security Deposit', 'Monthly Rent', 'Utility Bill', 'Late Fee') NOT NULL,
      status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
      dueDate DATE,
      paidDate TIMESTAMP NULL,
      breakdown JSON,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `;

  let completed = 0;
  const total = 3;
  
  const checkComplete = () => {
    completed++;
    if (completed === total) {
      console.log("✅ Complete database schema created successfully!");
      process.exit(0);
    }
  };

  // Create properties table
  db.query(createPropertiesTable, (err) => {
    if (err) {
      console.error("❌ Error creating properties table:", err);
    } else {
      console.log("✅ Properties table created/verified");
    }
    checkComplete();
  });

  // Create bookings table
  db.query(createBookingsTable, (err) => {
    if (err) {
      console.error("❌ Error creating bookings table:", err);
    } else {
      console.log("✅ Bookings table created/verified");
    }
    checkComplete();
  });

  // Create payments table
  db.query(createPaymentsTable, (err) => {
    if (err) {
      console.error("❌ Error creating payments table:", err);
    } else {
      console.log("✅ Payments table created/verified");
    }
    checkComplete();
  });
};

setupCompleteSchema();