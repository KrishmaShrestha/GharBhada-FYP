import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PaymentPage.css';
import { showSuccess, showError } from '../utils/toastr';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState('security-deposit');
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'eSewa',
    // For security deposit
    depositAmount: 0,
    // For monthly rent
    rentAmount: 0,
    electricityUnits: 0,
    electricityAmount: 0,
    waterAmount: 1500,
    garbageAmount: 500,
    totalAmount: 0
  });

  const electricityRate = 12; // Per unit

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    calculateTotal();
  }, [paymentData.rentAmount, paymentData.electricityAmount, paymentData.waterAmount, paymentData.garbageAmount, paymentData.depositAmount, paymentType]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
      const data = await response.json();
      setBooking(data);
      
      // Set initial payment amounts
      setPaymentData(prev => ({
        ...prev,
        depositAmount: data.deposit,
        rentAmount: data.rent
      }));
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateElectricity = (units) => {
    return units * electricityRate;
  };

  const calculateTotal = () => {
    let total = 0;
    if (paymentType === 'security-deposit') {
      total = paymentData.depositAmount;
    } else {
      total = paymentData.rentAmount + paymentData.electricityAmount + paymentData.waterAmount + paymentData.garbageAmount;
    }
    
    setPaymentData(prev => ({
      ...prev,
      totalAmount: total
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'electricityUnits') {
      const units = parseFloat(value) || 0;
      const amount = calculateElectricity(units);
      setPaymentData(prev => ({
        ...prev,
        electricityUnits: units,
        electricityAmount: amount
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  const generateTransactionId = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const transactionId = generateTransactionId();
      
      let endpoint = '';
      let paymentPayload = {};
      
      if (paymentType === 'security-deposit') {
        endpoint = 'http://localhost:5000/api/payments/security-deposit';
        paymentPayload = {
          bookingId: bookingId,
          amount: paymentData.totalAmount,
          paymentMethod: paymentData.paymentMethod,
          transactionId: transactionId
        };
      } else {
        endpoint = 'http://localhost:5000/api/payments/monthly-rent';
        paymentPayload = {
          bookingId: bookingId,
          rentAmount: paymentData.rentAmount,
          electricityAmount: paymentData.electricityAmount,
          waterAmount: paymentData.waterAmount,
          garbageAmount: paymentData.garbageAmount,
          totalAmount: paymentData.totalAmount,
          paymentMethod: paymentData.paymentMethod,
          transactionId: transactionId,
          dueDate: new Date().toISOString().split('T')[0]
        };
      }

      // Simulate payment gateway processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload)
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(`Payment successful! Transaction ID: ${transactionId}`, 'Payment Complete');
        
        if (paymentType === 'security-deposit') {
          navigate('/tenant/dashboard');
        } else {
          navigate('/tenant/dashboard');
        }
      } else {
        const error = await response.json();
        showError(error.message || 'Payment failed', 'Payment Error');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      showError('Payment failed. Please try again.', 'Payment Error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="payment-error">
        <h2>Booking not found</h2>
        <button onClick={() => navigate('/tenant/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <button onClick={() => navigate('/tenant/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Payment</h1>
      </div>

      <div className="payment-content">
        {/* Property Summary */}
        <div className="property-summary">
          <h3>Property Details</h3>
          <div className="summary-item">
            <span className="label">Property:</span>
            <span className="value">{booking.propertyTitle}</span>
          </div>
          <div className="summary-item">
            <span className="label">Address:</span>
            <span className="value">{booking.propertyAddress}</span>
          </div>
          <div className="summary-item">
            <span className="label">Owner:</span>
            <span className="value">{booking.ownerName}</span>
          </div>
          <div className="summary-item">
            <span className="label">Lease Period:</span>
            <span className="value">{booking.leaseDuration}</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form-container">
          <div className="payment-type-selector">
            <h3>Payment Type</h3>
            <div className="payment-type-options">
              <label className="payment-type-option">
                <input
                  type="radio"
                  name="paymentType"
                  value="security-deposit"
                  checked={paymentType === 'security-deposit'}
                  onChange={(e) => setPaymentType(e.target.value)}
                />
                <span>Security Deposit</span>
              </label>
              <label className="payment-type-option">
                <input
                  type="radio"
                  name="paymentType"
                  value="monthly-rent"
                  checked={paymentType === 'monthly-rent'}
                  onChange={(e) => setPaymentType(e.target.value)}
                />
                <span>Monthly Rent & Utilities</span>
              </label>
            </div>
          </div>

          <div className="payment-details">
            {paymentType === 'security-deposit' ? (
              <div className="security-deposit-section">
                <h3>Security Deposit Payment</h3>
                <p className="payment-description">
                  Pay the security deposit to confirm your booking. This amount will be refunded at the end of your lease term.
                </p>
                <div className="payment-breakdown">
                  <div className="breakdown-item">
                    <span>Security Deposit:</span>
                    <span>₹{paymentData.depositAmount}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>Total Amount:</span>
                    <span>₹{paymentData.totalAmount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="monthly-rent-section">
                <h3>Monthly Rent & Utilities</h3>
                <p className="payment-description">
                  Pay your monthly rent along with utility charges.
                </p>
                
                <div className="utility-inputs">
                  <div className="form-group">
                    <label>Monthly Rent</label>
                    <input
                      type="number"
                      name="rentAmount"
                      value={paymentData.rentAmount}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Electricity Units Consumed</label>
                    <input
                      type="number"
                      name="electricityUnits"
                      value={paymentData.electricityUnits}
                      onChange={handleInputChange}
                      placeholder="Enter units consumed"
                      step="0.1"
                    />
                    <small>Rate: ₹{electricityRate} per unit</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Water Charges (Fixed)</label>
                    <input
                      type="number"
                      name="waterAmount"
                      value={paymentData.waterAmount}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Garbage Collection (Fixed)</label>
                    <input
                      type="number"
                      name="garbageAmount"
                      value={paymentData.garbageAmount}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="payment-breakdown">
                  <div className="breakdown-item">
                    <span>Monthly Rent:</span>
                    <span>₹{paymentData.rentAmount}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Electricity ({paymentData.electricityUnits} units):</span>
                    <span>₹{paymentData.electricityAmount}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Water Charges:</span>
                    <span>₹{paymentData.waterAmount}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Garbage Collection:</span>
                    <span>₹{paymentData.garbageAmount}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>Total Amount:</span>
                    <span>₹{paymentData.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="payment-method-section">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="eSewa"
                  checked={paymentData.paymentMethod === 'eSewa'}
                  onChange={handleInputChange}
                />
                <div className="method-info">
                  <span className="method-name">eSewa</span>
                  <span className="method-desc">Digital wallet payment</span>
                </div>
              </label>
              
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Khalti"
                  checked={paymentData.paymentMethod === 'Khalti'}
                  onChange={handleInputChange}
                />
                <div className="method-info">
                  <span className="method-name">Khalti</span>
                  <span className="method-desc">Digital wallet payment</span>
                </div>
              </label>
              
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Bank Transfer"
                  checked={paymentData.paymentMethod === 'Bank Transfer'}
                  onChange={handleInputChange}
                />
                <div className="method-info">
                  <span className="method-name">Bank Transfer</span>
                  <span className="method-desc">Direct bank transfer</span>
                </div>
              </label>
            </div>
          </div>

          <div className="payment-actions">
            <button 
              onClick={() => navigate('/tenant/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handlePayment}
              className="btn-primary"
              disabled={processing || paymentData.totalAmount <= 0}
            >
              {processing ? 'Processing Payment...' : `Pay ₹${paymentData.totalAmount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;