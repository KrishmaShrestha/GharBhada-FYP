import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Agreement.css';

const Agreement = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/approve-agreement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Agreement approved! Please proceed to payment.');
        navigate(`/payment/${bookingId}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to approve agreement');
      }
    } catch (error) {
      console.error('Error approving agreement:', error);
      alert('Failed to approve agreement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this agreement? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/decline-agreement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Agreement declined. You will be redirected to your dashboard.');
        navigate('/tenant/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to decline agreement');
      }
    } catch (error) {
      console.error('Error declining agreement:', error);
      alert('Failed to decline agreement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="agreement-loading">
        <div className="loading-spinner"></div>
        <p>Loading agreement...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="agreement-error">
        <h2>Agreement not found</h2>
        <button onClick={() => navigate('/tenant/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const monthlyUtilityCost = 2000; // Water + Garbage (fixed)
  const electricityRate = 12; // Per unit

  return (
    <div className="agreement-container">
      <div className="agreement-header">
        <button onClick={() => navigate('/tenant/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Rental Agreement</h1>
      </div>

      <div className="agreement-content">
        <div className="agreement-document">
          <div className="document-header">
            <h2>RENTAL AGREEMENT</h2>
            <p className="document-subtitle">GharBhada Platform - Digital Rental Agreement</p>
          </div>

          <div className="agreement-section">
            <h3>PARTIES</h3>
            <div className="parties-info">
              <div className="party">
                <h4>LANDLORD/OWNER</h4>
                <p><strong>Name:</strong> {booking.ownerName}</p>
                <p><strong>Email:</strong> {booking.ownerEmail}</p>
                <p><strong>Phone:</strong> {booking.ownerPhone}</p>
              </div>
              <div className="party">
                <h4>TENANT</h4>
                <p><strong>Name:</strong> {booking.tenantName}</p>
                <p><strong>Email:</strong> {booking.email}</p>
                <p><strong>Phone:</strong> {booking.phone}</p>
              </div>
            </div>
          </div>

          <div className="agreement-section">
            <h3>PROPERTY DETAILS</h3>
            <div className="property-info">
              <p><strong>Property:</strong> {booking.propertyTitle}</p>
              <p><strong>Address:</strong> {booking.propertyAddress}</p>
              <p><strong>Type:</strong> {booking.bhk} - {booking.type}</p>
            </div>
          </div>

          <div className="agreement-section">
            <h3>LEASE TERMS</h3>
            <div className="lease-info">
              <p><strong>Lease Duration:</strong> {booking.leaseDuration}</p>
              <p><strong>Start Date:</strong> {new Date(booking.leaseStartDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(booking.leaseEndDate).toLocaleDateString()}</p>
              {booking.additionalTerms && (
                <div>
                  <p><strong>Additional Terms:</strong></p>
                  <p className="additional-terms">{booking.additionalTerms}</p>
                </div>
              )}
            </div>
          </div>

          <div className="agreement-section">
            <h3>FINANCIAL TERMS</h3>
            <div className="financial-info">
              <div className="payment-item">
                <span>Monthly Rent:</span>
                <span>₹{booking.rent}</span>
              </div>
              <div className="payment-item">
                <span>Security Deposit:</span>
                <span>₹{booking.deposit}</span>
              </div>
              <div className="payment-item">
                <span>Water & Garbage (Fixed Monthly):</span>
                <span>₹{monthlyUtilityCost}</span>
              </div>
              <div className="payment-item">
                <span>Electricity:</span>
                <span>₹{electricityRate} per unit (as per meter reading)</span>
              </div>
              <div className="payment-item total">
                <span>Base Monthly Payment:</span>
                <span>₹{booking.rent + monthlyUtilityCost} + Electricity</span>
              </div>
            </div>
          </div>

          <div className="agreement-section">
            <h3>TERMS AND CONDITIONS</h3>
            <div className="terms-list">
              <div className="term-item">
                <h4>1. RENT PAYMENT</h4>
                <p>The tenant agrees to pay the monthly rent of ₹{booking.rent} on or before the 5th of each month. Late payments may incur additional charges.</p>
              </div>
              
              <div className="term-item">
                <h4>2. SECURITY DEPOSIT</h4>
                <p>A security deposit of ₹{booking.deposit} must be paid before moving in. This deposit will be refunded at the end of the lease term, subject to property condition assessment.</p>
              </div>
              
              <div className="term-item">
                <h4>3. UTILITIES</h4>
                <p>Water and garbage collection fees are fixed at ₹{monthlyUtilityCost} per month. Electricity charges will be calculated based on actual consumption at ₹{electricityRate} per unit as per the meter reading.</p>
              </div>
              
              <div className="term-item">
                <h4>4. PROPERTY MAINTENANCE</h4>
                <p>The tenant is responsible for keeping the property clean and in good condition. Any damages beyond normal wear and tear will be deducted from the security deposit.</p>
              </div>
              
              <div className="term-item">
                <h4>5. TERMINATION</h4>
                <p>Either party may terminate this agreement with 30 days written notice. Early termination by the tenant may result in forfeiture of the security deposit.</p>
              </div>
              
              <div className="term-item">
                <h4>6. SUBLETTING</h4>
                <p>The tenant may not sublet the property or allow additional occupants without written consent from the landlord.</p>
              </div>
              
              <div className="term-item">
                <h4>7. PETS AND SMOKING</h4>
                <p>Pets: {booking.hasPets ? 'Allowed as declared in application' : 'Not allowed'}. Smoking is strictly prohibited inside the property.</p>
              </div>
              
              <div className="term-item">
                <h4>8. DIGITAL PLATFORM</h4>
                <p>This agreement is facilitated through the GharBhada platform. All payments, communications, and maintenance requests should be processed through the platform.</p>
              </div>
            </div>
          </div>

          <div className="agreement-section">
            <h3>ACKNOWLEDGMENT</h3>
            <p>By signing this agreement digitally, both parties acknowledge that they have read, understood, and agree to all the terms and conditions stated above. This digital agreement is legally binding and enforceable.</p>
          </div>

          <div className="signature-section">
            <div className="signature-box">
              <p><strong>Landlord Digital Signature:</strong></p>
              <div className="signature-placeholder">
                <p>✓ Approved by {booking.ownerName}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="signature-box pending">
              <p><strong>Tenant Digital Signature:</strong></p>
              <div className="signature-placeholder">
                <p>Pending approval from {booking.tenantName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="agreement-actions">
          <div className="agreement-checkbox">
            <label>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I have read and agree to all the terms and conditions of this rental agreement
            </label>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleDecline}
              className="btn-decline"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Decline Agreement'}
            </button>
            <button 
              onClick={handleApprove}
              className="btn-approve"
              disabled={!agreed || submitting}
            >
              {submitting ? 'Processing...' : 'Approve & Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agreement;