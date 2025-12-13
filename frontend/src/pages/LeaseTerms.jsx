import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LeaseTerms.css';

const LeaseTerms = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [leaseData, setLeaseData] = useState({
    duration: '',
    customDuration: '',
    startDate: '',
    additionalTerms: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
      const data = await response.json();
      setBooking(data);
      
      // Pre-fill if lease terms already exist
      if (data.leaseDuration) {
        if (['1 year', '2 years', '3 years', '4 years', '5 years'].includes(data.leaseDuration)) {
          setLeaseData(prev => ({
            ...prev,
            duration: data.leaseDuration,
            startDate: data.leaseStartDate || '',
            additionalTerms: data.additionalTerms || ''
          }));
        } else {
          setLeaseData(prev => ({
            ...prev,
            duration: 'custom',
            customDuration: data.leaseDuration,
            startDate: data.leaseStartDate || '',
            additionalTerms: data.additionalTerms || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) return '';
    
    const start = new Date(startDate);
    let years = 0;
    let months = 0;
    
    if (duration === 'custom') {
      // Parse custom duration like "3 years 4 months"
      const customDuration = leaseData.customDuration.toLowerCase();
      const yearMatch = customDuration.match(/(\d+)\s*years?/);
      const monthMatch = customDuration.match(/(\d+)\s*months?/);
      
      if (yearMatch) years = parseInt(yearMatch[1]);
      if (monthMatch) months = parseInt(monthMatch[1]);
    } else {
      years = parseInt(duration.split(' ')[0]);
    }
    
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + years);
    end.setMonth(end.getMonth() + months);
    
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalDuration = leaseData.duration === 'custom' ? leaseData.customDuration : leaseData.duration;
      const endDate = calculateEndDate(leaseData.startDate, leaseData.duration);

      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/lease-terms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaseDuration: finalDuration,
          leaseStartDate: leaseData.startDate,
          leaseEndDate: endDate,
          additionalTerms: leaseData.additionalTerms
        })
      });

      if (response.ok) {
        alert('Lease terms submitted successfully! Waiting for owner approval.');
        navigate('/tenant/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit lease terms');
      }
    } catch (error) {
      console.error('Error submitting lease terms:', error);
      alert('Failed to submit lease terms');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="lease-loading">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="lease-error">
        <h2>Booking not found</h2>
        <button onClick={() => navigate('/tenant/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="lease-container">
      <div className="lease-header">
        <button onClick={() => navigate('/tenant/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Lease Terms</h1>
      </div>

      <div className="lease-content">
        {/* Booking Summary */}
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span className="label">Property:</span>
            <span className="value">{booking.propertyTitle}</span>
          </div>
          <div className="summary-item">
            <span className="label">Address:</span>
            <span className="value">{booking.propertyAddress}</span>
          </div>
          <div className="summary-item">
            <span className="label">Monthly Rent:</span>
            <span className="value">₹{booking.rent}</span>
          </div>
          <div className="summary-item">
            <span className="label">Security Deposit:</span>
            <span className="value">₹{booking.deposit}</span>
          </div>
          <div className="summary-item">
            <span className="label">Owner:</span>
            <span className="value">{booking.ownerName}</span>
          </div>
          <div className="summary-item">
            <span className="label">Status:</span>
            <span className={`status ${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Lease Terms Form */}
        <div className="lease-form-container">
          <form onSubmit={handleSubmit} className="lease-form">
            <h2>Set Lease Terms</h2>
            <p className="form-description">
              Please specify your preferred lease duration and start date. The owner will review and approve these terms.
            </p>

            <div className="form-section">
              <h3>Lease Duration</h3>
              <div className="duration-options">
                {['1 year', '2 years', '3 years', '4 years', '5 years'].map(duration => (
                  <label key={duration} className="duration-option">
                    <input
                      type="radio"
                      name="duration"
                      value={duration}
                      checked={leaseData.duration === duration}
                      onChange={handleInputChange}
                    />
                    <span className="duration-label">{duration}</span>
                  </label>
                ))}
                <label className="duration-option">
                  <input
                    type="radio"
                    name="duration"
                    value="custom"
                    checked={leaseData.duration === 'custom'}
                    onChange={handleInputChange}
                  />
                  <span className="duration-label">Custom</span>
                </label>
              </div>

              {leaseData.duration === 'custom' && (
                <div className="custom-duration">
                  <label>Custom Duration</label>
                  <input
                    type="text"
                    name="customDuration"
                    value={leaseData.customDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 years 4 months"
                    required
                  />
                  <small>Enter duration like "3 years 4 months" or "18 months"</small>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Lease Period</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={leaseData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date (Calculated)</label>
                  <input
                    type="date"
                    value={calculateEndDate(leaseData.startDate, leaseData.duration)}
                    disabled
                    className="calculated-field"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Terms (Optional)</h3>
              <div className="form-group">
                <label>Additional Terms & Conditions</label>
                <textarea
                  name="additionalTerms"
                  value={leaseData.additionalTerms}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Any additional terms or special requests you'd like to include in the lease agreement..."
                />
                <small>These terms will be included in the final lease agreement</small>
              </div>
            </div>

            <div className="lease-preview">
              <h3>Lease Summary</h3>
              <div className="preview-content">
                <p><strong>Duration:</strong> {leaseData.duration === 'custom' ? leaseData.customDuration : leaseData.duration}</p>
                {leaseData.startDate && (
                  <>
                    <p><strong>Start Date:</strong> {new Date(leaseData.startDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {calculateEndDate(leaseData.startDate, leaseData.duration) ? 
                      new Date(calculateEndDate(leaseData.startDate, leaseData.duration)).toLocaleDateString() : 'Not calculated'}</p>
                  </>
                )}
                <p><strong>Monthly Rent:</strong> ₹{booking.rent}</p>
                <p><strong>Security Deposit:</strong> ₹{booking.deposit}</p>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/tenant/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting || !leaseData.duration || !leaseData.startDate}
              >
                {submitting ? 'Submitting...' : 'Submit Lease Terms'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaseTerms;