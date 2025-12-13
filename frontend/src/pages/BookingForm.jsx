import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingForm.css';

const BookingForm = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentAddress: '',
    occupation: '',
    monthlyIncome: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    moveInDate: '',
    familySize: '',
    hasChildren: false,
    hasPets: false,
    additionalNotes: '',
    idDocument: null
  });

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      idDocument: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'idDocument' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'idDocument') {
          submitData.append(key, formData[key]);
        }
      });
      
      submitData.append('propertyId', propertyId);
      submitData.append('tenantId', user.id);

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        alert('Booking request submitted successfully! The owner will review your request.');
        navigate('/tenant/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit booking request');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="booking-error">
        <h2>Property not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>Book Property</h1>
      </div>

      <div className="booking-content">
        {/* Property Summary */}
        <div className="property-summary">
          <div className="property-image">
            {property.photos && property.photos.length > 0 ? (
              <img 
                src={`http://localhost:5000/uploads/${property.photos[0]}`} 
                alt={property.title}
              />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>
          <div className="property-info">
            <h3>{property.title}</h3>
            <p className="address">{property.address}</p>
            <div className="property-details">
              <span className="type">{property.type}</span>
              <span className="bhk">{property.bhk}</span>
              <span className="furnishing">{property.furnishing}</span>
            </div>
            <div className="pricing">
              <div className="rent">₹{property.rent}/month</div>
              <div className="deposit">Deposit: ₹{property.deposit}</div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          <h2>Tenant Details</h2>
          
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Address *</label>
                <input
                  type="text"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Occupation *</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Monthly Income (₹) *</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact Name *</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone *</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Move-in Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Move-in Date *</label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Family Size *</label>
                <select
                  name="familySize"
                  value={formData.familySize}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select family size</option>
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5+">5+ people</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="hasChildren"
                    checked={formData.hasChildren}
                    onChange={handleInputChange}
                  />
                  I have children
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="hasPets"
                    checked={formData.hasPets}
                    onChange={handleInputChange}
                  />
                  I have pets
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any additional information you'd like to share with the owner..."
              />
            </div>

            <div className="form-group">
              <label>ID Document (Citizenship/Passport) *</label>
              <input
                type="file"
                name="idDocument"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                required
              />
              <small>Upload a clear photo of your citizenship certificate or passport</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;