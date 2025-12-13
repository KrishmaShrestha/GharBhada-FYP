import db from "../config/db.js";

// Create a new booking request
export const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      tenantId,
      fullName,
      email,
      phone,
      currentAddress,
      occupation,
      monthlyIncome,
      emergencyContactName,
      emergencyContactPhone,
      moveInDate,
      familySize,
      hasChildren,
      hasPets,
      additionalNotes
    } = req.body;

    const idDocument = req.file ? req.file.filename : null;

    const [result] = await db.execute(
      `INSERT INTO bookings (
        propertyId, tenantId, fullName, email, phone, currentAddress, 
        occupation, monthlyIncome, emergencyContactName, emergencyContactPhone, 
        moveInDate, familySize, hasChildren, hasPets, additionalNotes, idDocument
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        propertyId, tenantId, fullName, email, phone, currentAddress,
        occupation, monthlyIncome, emergencyContactName, emergencyContactPhone,
        moveInDate, familySize, hasChildren === 'true', hasPets === 'true', 
        additionalNotes, idDocument
      ]
    );

    res.status(201).json({
      message: "Booking request submitted successfully",
      bookingId: result.insertId
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all bookings (Admin)
export const getBookings = async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT b.*, p.title as propertyTitle, p.address as propertyAddress,
             t.fullName as tenantName, o.fullName as ownerName
      FROM bookings b
      JOIN properties p ON b.propertyId = p.id
      JOIN users t ON b.tenantId = t.id
      JOIN users o ON p.ownerId = o.id
      ORDER BY b.createdAt DESC
    `);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get bookings for a specific owner
export const getOwnerBookings = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const [bookings] = await db.execute(`
      SELECT b.*, p.title as propertyTitle, p.address as propertyAddress,
             t.fullName as tenantName, t.email as tenantEmail, t.phone as tenantPhone
      FROM bookings b
      JOIN properties p ON b.propertyId = p.id
      JOIN users t ON b.tenantId = t.id
      WHERE p.ownerId = ?
      ORDER BY b.createdAt DESC
    `, [ownerId]);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get bookings for a specific tenant
export const getTenantBookings = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const [bookings] = await db.execute(`
      SELECT b.*, p.title as propertyTitle, p.address as propertyAddress,
             p.rent, p.deposit, o.fullName as ownerName, o.email as ownerEmail, o.phone as ownerPhone
      FROM bookings b
      JOIN properties p ON b.propertyId = p.id
      JOIN users o ON p.ownerId = o.id
      WHERE b.tenantId = ?
      ORDER BY b.createdAt DESC
    `, [tenantId]);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching tenant bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.execute(`
      SELECT b.*, p.title as propertyTitle, p.address as propertyAddress,
             p.rent, p.deposit, p.photos, t.fullName as tenantName, 
             o.fullName as ownerName, o.email as ownerEmail, o.phone as ownerPhone
      FROM bookings b
      JOIN properties p ON b.propertyId = p.id
      JOIN users t ON b.tenantId = t.id
      JOIN users o ON p.ownerId = o.id
      WHERE b.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update booking status (Approve/Reject by Owner)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    await db.execute(
      `UPDATE bookings SET status = ?, rejectionReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, rejectionReason || null, id]
    );

    res.json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit lease terms (Tenant)
export const submitLeaseTerms = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaseDuration, leaseStartDate, leaseEndDate, additionalTerms } = req.body;

    await db.execute(
      `UPDATE bookings SET 
        leaseDuration = ?, 
        leaseStartDate = ?, 
        leaseEndDate = ?, 
        additionalTerms = ?,
        status = 'Lease Terms Submitted',
        updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [leaseDuration, leaseStartDate, leaseEndDate, additionalTerms, id]
    );

    res.json({ message: "Lease terms submitted successfully" });
  } catch (error) {
    console.error("Error submitting lease terms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve lease terms (Owner)
export const approveLeaseTerms = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      `UPDATE bookings SET status = 'Lease Terms Approved', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    res.json({ message: "Lease terms approved successfully" });
  } catch (error) {
    console.error("Error approving lease terms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject booking
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    await db.execute(
      `UPDATE bookings SET status = 'Rejected', rejectionReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [rejectionReason, id]
    );

    res.json({ message: "Booking rejected successfully" });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve agreement (Tenant)
export const approveAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      `UPDATE bookings SET 
        status = 'Agreement Approved', 
        agreementDate = CURRENT_TIMESTAMP,
        updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [id]
    );

    res.json({ message: "Agreement approved successfully" });
  } catch (error) {
    console.error("Error approving agreement:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Decline agreement (Tenant)
export const declineAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      `UPDATE bookings SET status = 'Agreement Declined', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    res.json({ message: "Agreement declined" });
  } catch (error) {
    console.error("Error declining agreement:", error);
    res.status(500).json({ message: "Server error" });
  }
};