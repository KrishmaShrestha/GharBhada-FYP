import db from "../config/db.js";

export const createProperty = (req, res) => {
  const {
    title,
    address,
    type,
    bhk,
    rent,
    deposit,
    furnishing,
    amenities,
    rules,
    ownerId
  } = req.body;

  // Validate required fields
  if (!title || !address || !type || !bhk || !rent || !deposit || !furnishing || !ownerId) {
    return res.status(400).json({ 
      message: "Missing required fields. Please fill in all required information.",
      missingFields: {
        title: !title,
        address: !address,
        type: !type,
        bhk: !bhk,
        rent: !rent,
        deposit: !deposit,
        furnishing: !furnishing,
        ownerId: !ownerId
      }
    });
  }

  // Validate numeric fields
  if (isNaN(rent) || isNaN(deposit) || rent <= 0 || deposit <= 0) {
    return res.status(400).json({ 
      message: "Rent and deposit must be valid positive numbers"
    });
  }

  const photos = req.files ? req.files.map(file => file.filename) : [];

  const sql = `
    INSERT INTO properties 
    (title, address, type, bhk, rent, deposit, furnishing, amenities, rules, photos, ownerId, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(
    sql,
    [
      title,
      address,
      type,
      bhk,
      parseFloat(rent),
      parseFloat(deposit),
      furnishing,
      amenities || '',
      rules || '',
      JSON.stringify(photos),
      parseInt(ownerId)
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating property:", err);
        
        // Handle specific database errors
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ 
            message: "Invalid owner ID. Please login again."
          });
        }
        
        return res.status(500).json({ 
          message: "Database error occurred while creating property. Please try again.",
          error: err.sqlMessage || err.message
        });
      }

      return res.json({ 
        message: "Property created successfully and submitted for approval",
        propertyId: result.insertId
      });
    }
  );
};

export const getProperties = (req, res) => {
  const { location, type, bhk, minRent, maxRent, furnishing } = req.query;
  
  let sql = `
    SELECT p.*, u.fullName as ownerName, u.email as ownerEmail, u.phone as ownerPhone,
           DATEDIFF(NOW(), u.createdAt) / 365 as ownerYearsOnPlatform
    FROM properties p 
    JOIN users u ON p.ownerId = u.id 
    WHERE p.status = 'Active'
  `;
  
  const params = [];
  
  if (location) {
    sql += " AND p.address LIKE ?";
    params.push(`%${location}%`);
  }
  
  if (type) {
    sql += " AND p.type = ?";
    params.push(type);
  }
  
  if (bhk) {
    sql += " AND p.bhk = ?";
    params.push(bhk);
  }
  
  if (minRent) {
    sql += " AND p.rent >= ?";
    params.push(minRent);
  }
  
  if (maxRent) {
    sql += " AND p.rent <= ?";
    params.push(maxRent);
  }
  
  if (furnishing) {
    sql += " AND p.furnishing = ?";
    params.push(furnishing);
  }

  sql += " ORDER BY p.createdAt DESC";

  db.query(sql, params, (err, data) => {
    if (err) {
      console.error("Error fetching properties:", err);
      return res.status(500).json({ message: "Error fetching properties", error: err });
    }

    // Process the data to include owner trust level
    const properties = data.map(property => ({
      ...property,
      photos: JSON.parse(property.photos || '[]'),
      amenities: property.amenities ? property.amenities.split(',') : [],
      ownerTrustLevel: property.ownerYearsOnPlatform >= 1 ? 'Trusted' : 'Regular',
      ownerRating: 4.2 + Math.random() * 0.8 // Mock rating for now
    }));

    return res.json(properties);
  });
};

export const getPropertyById = (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT p.*, u.fullName as ownerName, u.email as ownerEmail, u.phone as ownerPhone,
           DATEDIFF(NOW(), u.createdAt) / 365 as ownerYearsOnPlatform
    FROM properties p 
    JOIN users u ON p.ownerId = u.id 
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching property:", err);
      return res.status(500).json({ message: "Error fetching property", error: err });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = {
      ...data[0],
      photos: JSON.parse(data[0].photos || '[]'),
      amenities: data[0].amenities ? data[0].amenities.split(',') : [],
      rules: data[0].rules ? data[0].rules.split('\n') : [],
      ownerTrustLevel: data[0].ownerYearsOnPlatform >= 1 ? 'Trusted' : 'Regular',
      ownerRating: 4.2 + Math.random() * 0.8
    };

    return res.json(property);
  });
};

export const getOwnerProperties = (req, res) => {
  const { ownerId } = req.params;
  
  const sql = `
    SELECT p.*, 
           COUNT(b.id) as totalBookings,
           SUM(CASE WHEN b.status = 'Active' THEN 1 ELSE 0 END) as activeBookings
    FROM properties p 
    LEFT JOIN bookings b ON p.id = b.propertyId 
    WHERE p.ownerId = ? 
    GROUP BY p.id
    ORDER BY p.createdAt DESC
  `;

  db.query(sql, [ownerId], (err, data) => {
    if (err) {
      console.error("Error fetching owner properties:", err);
      return res.status(500).json({ message: "Error fetching properties", error: err });
    }

    const properties = data.map(property => ({
      ...property,
      photos: JSON.parse(property.photos || '[]'),
      amenities: property.amenities ? property.amenities.split(',') : [],
      occupancyStatus: property.activeBookings > 0 ? 'Occupied' : 'Vacant'
    }));

    return res.json(properties);
  });
};

export const updateProperty = (req, res) => {
  const { id } = req.params;
  const {
    title,
    address,
    type,
    bhk,
    rent,
    deposit,
    furnishing,
    amenities,
    rules
  } = req.body;

  const photos = req.files ? req.files.map(file => file.filename) : null;

  let sql = `
    UPDATE properties 
    SET title = ?, address = ?, type = ?, bhk = ?, rent = ?, deposit = ?, 
        furnishing = ?, amenities = ?, rules = ?
  `;
  
  const params = [title, address, type, bhk, rent, deposit, furnishing, amenities, rules];

  if (photos && photos.length > 0) {
    sql += ", photos = ?";
    params.push(JSON.stringify(photos));
  }

  sql += " WHERE id = ?";
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating property:", err);
      return res.status(500).json({ message: "Error updating property", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json({ message: "Property updated successfully" });
  });
};

export const deleteProperty = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM properties WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting property:", err);
      return res.status(500).json({ message: "Error deleting property", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json({ message: "Property deleted successfully" });
  });
};

// Update property status (Admin only)
export const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.execute(
      "UPDATE properties SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property status updated successfully" });
  } catch (error) {
    console.error("Error updating property status:", error);
    res.status(500).json({ message: "Server error" });
  }
};