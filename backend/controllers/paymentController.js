import db from "../config/db.js";

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      paymentMethod,
      transactionId,
      paymentType,
      dueDate,
      breakdown
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO payments (
        bookingId, amount, paymentMethod, transactionId, 
        paymentType, dueDate, breakdown
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId, amount, paymentMethod, transactionId,
        paymentType, dueDate, JSON.stringify(breakdown)
      ]
    );

    res.status(201).json({
      message: "Payment created successfully",
      paymentId: result.insertId
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Process security deposit payment
export const processSecurityDeposit = async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      paymentMethod,
      transactionId
    } = req.body;

    // Create payment record
    const [paymentResult] = await db.execute(
      `INSERT INTO payments (
        bookingId, amount, paymentMethod, transactionId, 
        paymentType, status, paidDate
      ) VALUES (?, ?, ?, ?, 'Security Deposit', 'Completed', CURRENT_TIMESTAMP)`,
      [bookingId, amount, paymentMethod, transactionId]
    );

    // Update booking status to Payment Completed
    await db.execute(
      `UPDATE bookings SET status = 'Payment Completed', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [bookingId]
    );

    res.status(201).json({
      message: "Security deposit payment processed successfully",
      paymentId: paymentResult.insertId
    });
  } catch (error) {
    console.error("Error processing security deposit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Process monthly rent payment
export const processMonthlyRent = async (req, res) => {
  try {
    const {
      bookingId,
      rentAmount,
      electricityAmount,
      waterAmount,
      garbageAmount,
      totalAmount,
      paymentMethod,
      transactionId,
      dueDate
    } = req.body;

    const breakdown = {
      rent: rentAmount,
      electricity: electricityAmount,
      water: waterAmount,
      garbage: garbageAmount,
      total: totalAmount
    };

    // Create payment record
    const [paymentResult] = await db.execute(
      `INSERT INTO payments (
        bookingId, amount, paymentMethod, transactionId, 
        paymentType, status, paidDate, dueDate, breakdown
      ) VALUES (?, ?, ?, ?, 'Monthly Rent', 'Completed', CURRENT_TIMESTAMP, ?, ?)`,
      [bookingId, totalAmount, paymentMethod, transactionId, dueDate, JSON.stringify(breakdown)]
    );

    res.status(201).json({
      message: "Monthly rent payment processed successfully",
      paymentId: paymentResult.insertId
    });
  } catch (error) {
    console.error("Error processing monthly rent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all payments (Admin)
export const getPayments = async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT p.*, b.propertyId, pr.title as propertyTitle,
             t.fullName as tenantName, o.fullName as ownerName
      FROM payments p
      JOIN bookings b ON p.bookingId = b.id
      JOIN properties pr ON b.propertyId = pr.id
      JOIN users t ON b.tenantId = t.id
      JOIN users o ON pr.ownerId = o.id
      ORDER BY p.createdAt DESC
    `);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payments for a specific owner
export const getOwnerPayments = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const [payments] = await db.execute(`
      SELECT p.*, b.propertyId, pr.title as propertyTitle,
             t.fullName as tenantName, t.email as tenantEmail
      FROM payments p
      JOIN bookings b ON p.bookingId = b.id
      JOIN properties pr ON b.propertyId = pr.id
      JOIN users t ON b.tenantId = t.id
      WHERE pr.ownerId = ?
      ORDER BY p.createdAt DESC
    `, [ownerId]);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching owner payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payments for a specific tenant
export const getTenantPayments = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const [payments] = await db.execute(`
      SELECT p.*, b.propertyId, pr.title as propertyTitle,
             pr.address as propertyAddress, o.fullName as ownerName
      FROM payments p
      JOIN bookings b ON p.bookingId = b.id
      JOIN properties pr ON b.propertyId = pr.id
      JOIN users o ON pr.ownerId = o.id
      WHERE b.tenantId = ?
      ORDER BY p.createdAt DESC
    `, [tenantId]);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching tenant payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await db.execute(`
      SELECT p.*, b.propertyId, pr.title as propertyTitle,
             t.fullName as tenantName, o.fullName as ownerName
      FROM payments p
      JOIN bookings b ON p.bookingId = b.id
      JOIN properties pr ON b.propertyId = pr.id
      JOIN users t ON b.tenantId = t.id
      JOIN users o ON pr.ownerId = o.id
      WHERE p.id = ?
    `, [id]);

    if (payments.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payments[0]);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(
      `UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id]
    );

    res.json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
};