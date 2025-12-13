-- GharBhada Database Schema

-- Users table (already exists, but including for completeness)
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
  status ENUM('Pending', 'Active', 'Suspended') DEFAULT 'Pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties table
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
);

-- Bookings table
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
);

-- Payments table
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
);

-- Complaints/Maintenance table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  tenantId INT NOT NULL,
  propertyId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Plumbing', 'Electrical', 'Structural', 'Appliance', 'Security', 'Other') NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Pending',
  photos JSON,
  assignedTo VARCHAR(255),
  resolutionNotes TEXT,
  resolvedDate TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_properties_owner ON properties(ownerId);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_bookings_property ON bookings(propertyId);
CREATE INDEX idx_bookings_tenant ON bookings(tenantId);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(bookingId);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_complaints_booking ON complaints(bookingId);
CREATE INDEX idx_complaints_status ON complaints(status);