import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, Building2, Bell, User, CreditCard, FileText, MessageSquare, LogOut, Eye, Edit, Trash2, Check, X, MapPin, Shield, Calendar, Phone, Mail } from 'lucide-react';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || user.role !== 'Owner') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData(user.id);
  }, [navigate]);

  const fetchDashboardData = async (ownerId) => {
    try {
      const [propertiesRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/properties/owner/${ownerId}`),
        fetch(`http://localhost:5000/api/bookings/owner/${ownerId}`),
        fetch(`http://localhost:5000/api/payments/owner/${ownerId}`)
      ]);

      const [propertiesData, bookingsData, paymentsData] = await Promise.all([
        propertiesRes.json(),
        bookingsRes.json(),
        paymentsRes.json()
      ]);

      setProperties(propertiesData);
      setBookings(bookingsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleBookingAction = async (bookingId, action, rejectionReason = '') => {
    try {
      let endpoint = '';
      let body = {};

      switch (action) {
        case 'approve':
          endpoint = `http://localhost:5000/api/bookings/${bookingId}/status`;
          body = { status: 'Approved' };
          break;
        case 'reject':
          endpoint = `http://localhost:5000/api/bookings/${bookingId}/reject`;
          body = { rejectionReason };
          break;
        case 'approve-lease':
          endpoint = `http://localhost:5000/api/bookings/${bookingId}/approve-lease`;
          body = {};
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Refresh bookings data
        const user = JSON.parse(localStorage.getItem('user'));
        fetchDashboardData(user.id);
        alert(`Booking ${action}d successfully`);
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking`);
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'Pending Owner Approval': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Lease Terms Submitted': return 'info';
      case 'Lease Terms Approved': return 'success';
      case 'Agreement Pending': return 'warning';
      case 'Agreement Approved': return 'success';
      case 'Payment Completed': return 'success';
      case 'Active': return 'active';
      default: return 'default';
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        alert('User not found. Please login again.');
        return;
      }

      const formData = new FormData(e.target);
      formData.append('ownerId', user.id);

      // Validate required fields
      const title = formData.get('title');
      const address = formData.get('address');
      const type = formData.get('type');
      const bhk = formData.get('bhk');
      const rent = formData.get('rent');
      const deposit = formData.get('deposit');
      const furnishing = formData.get('furnishing');

      if (!title || !address || !type || !bhk || !rent || !deposit || !furnishing) {
        alert('Please fill in all required fields.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('Property submitted for approval successfully!');
        setShowAddPropertyModal(false);
        // Refresh properties data
        fetchDashboardData(user.id);
        // Reset form
        e.target.reset();
      } else {
        console.error('Error response:', responseData);
        alert(responseData.message || 'Failed to add property. Please try again.');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="owner-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Home className="logo-icon" />
          <div>
            <h2 className="logo-text">GharBhada</h2>
            <p className="logo-tagline">Owner Portal</p>
          </div>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'properties', icon: Building2, label: 'My Properties' },
            { id: 'requests', icon: Bell, label: 'Booking Requests' },
            { id: 'payments', icon: CreditCard, label: 'Payments' },
            { id: 'agreements', icon: FileText, label: 'Agreements' },
            { id: 'maintenance', icon: MessageSquare, label: 'Maintenance' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">
              {activeTab === 'properties' && 'My Properties'}
              {activeTab === 'requests' && 'Booking Requests'}
              {activeTab === 'payments' && 'Payment History'}
              {activeTab === 'agreements' && 'Rental Agreements'}
              {activeTab === 'maintenance' && 'Maintenance Requests'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="page-subtitle">Manage your rental business with ease</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
            <div className="user-avatar">O</div>
          </div>
        </header>

        {/* User Status Check */}
        {JSON.parse(localStorage.getItem('user') || '{}').status === 'Pending' && (
          <div className="status-banner pending">
            <h3>Account Pending Approval</h3>
            <p>Your account is pending admin approval. You can add properties, but they won't be visible until your account is approved.</p>
          </div>
        )}

        {JSON.parse(localStorage.getItem('user') || '{}').status === 'Suspended' && (
          <div className="status-banner suspended">
            <h3>Account Suspended</h3>
            <p>Your account has been suspended. Please contact support for assistance.</p>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <>
            <div className="section-header">
              <button className="btn-primary" onClick={() => setShowAddPropertyModal(true)}>
                <Plus size={20} />
                Add New Property
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Properties</h4>
                <strong>{properties.length}</strong>
              </div>
              <div className="stat-card success">
                <h4>Active Properties</h4>
                <strong>{properties.filter(p => p.status === 'Active').length}</strong>
              </div>
              <div className="stat-card warning">
                <h4>Pending Approval</h4>
                <strong>{properties.filter(p => p.status === 'Pending').length}</strong>
              </div>
              <div className="stat-card income">
                <h4>Monthly Income</h4>
                <strong>₹{properties.filter(p => p.status === 'Active').reduce((sum, p) => sum + p.rent, 0).toLocaleString()}</strong>
              </div>
            </div>

            <div className="properties-grid">
              {loading ? (
                <div className="loading-message">Loading properties...</div>
              ) : properties.length === 0 ? (
                <div className="no-data">
                  <Building2 size={48} />
                  <h3>No Properties Listed</h3>
                  <p>Start by adding your first property</p>
                  <button 
                    className="add-property-btn"
                    onClick={() => setShowAddPropertyModal(true)}
                  >
                    Add Property
                  </button>
                </div>
              ) : (
                properties.map(p => (
                  <div key={p.id} className="property-card">
                    <div className="property-image">
                      {p.photos && p.photos.length > 0 ? (
                        <img 
                          src={`http://localhost:5000/uploads/${p.photos[0]}`} 
                          alt={p.title}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      {p.verified && (
                        <div className="verified-badge"><Shield size={14} /> Verified</div>
                      )}
                    </div>
                    <div className="property-content">
                      <div className="property-header">
                        <div>
                          <h3>{p.title}</h3>
                          <p className="location"><MapPin size={16} /> {p.address}</p>
                        </div>
                        <div className="badges">
                          <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
                        </div>
                      </div>
                      <div className="property-info">
                        <span>Rent: <strong>₹{p.rent.toLocaleString()}/mo</strong></span>
                        <span>Deposit: <strong>₹{p.deposit.toLocaleString()}</strong></span>
                        <span>Type: <strong>{p.bhk} {p.type}</strong></span>
                      </div>
                      <div className="property-actions">
                        <button className="action-btn"><Eye size={18} /> View</button>
                        <button className="action-btn"><Edit size={18} /> Edit</button>
                        <button className="action-btn danger"><Trash2 size={18} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Booking Requests Tab */}
        {activeTab === 'requests' && (
          <div className="requests-section">
            {loading ? (
              <div className="loading-message">Loading booking requests...</div>
            ) : bookings.length === 0 ? (
              <div className="no-data">
                <Bell size={48} />
                <h3>No Booking Requests</h3>
                <p>Booking requests from tenants will appear here</p>
              </div>
            ) : (
              <div className="requests-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="request-card">
                    <div className="request-header">
                      <div className="tenant-info">
                        <div className="tenant-avatar">
                          {booking.tenantName.charAt(0)}
                        </div>
                        <div className="tenant-details">
                          <h3>{booking.tenantName}</h3>
                          <p>{booking.email}</p>
                          <p>{booking.phone}</p>
                        </div>
                      </div>
                      <div className="request-status">
                        <span className={`status-badge ${getBookingStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="request-date">
                          Applied: {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="property-summary">
                      <h4>Property: {booking.propertyTitle}</h4>
                      <p>{booking.propertyAddress}</p>
                      <div className="booking-details">
                        <span>Monthly Rent: ₹{booking.rent}</span>
                        <span>Security Deposit: ₹{booking.deposit}</span>
                        <span>Move-in Date: {new Date(booking.moveInDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="tenant-application">
                      <div className="application-details">
                        <div className="detail-row">
                          <span className="label">Occupation:</span>
                          <span className="value">{booking.occupation}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Monthly Income:</span>
                          <span className="value">₹{booking.monthlyIncome}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Family Size:</span>
                          <span className="value">{booking.familySize}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Emergency Contact:</span>
                          <span className="value">{booking.emergencyContactName} ({booking.emergencyContactPhone})</span>
                        </div>
                        {booking.hasChildren && (
                          <div className="detail-row">
                            <span className="label">Has Children:</span>
                            <span className="value">Yes</span>
                          </div>
                        )}
                        {booking.hasPets && (
                          <div className="detail-row">
                            <span className="label">Has Pets:</span>
                            <span className="value">Yes</span>
                          </div>
                        )}
                        {booking.additionalNotes && (
                          <div className="detail-row">
                            <span className="label">Additional Notes:</span>
                            <span className="value">{booking.additionalNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {booking.leaseDuration && (
                      <div className="lease-terms">
                        <h4>Proposed Lease Terms</h4>
                        <div className="lease-details">
                          <span>Duration: {booking.leaseDuration}</span>
                          {booking.leaseStartDate && (
                            <span>Start Date: {new Date(booking.leaseStartDate).toLocaleDateString()}</span>
                          )}
                          {booking.leaseEndDate && (
                            <span>End Date: {new Date(booking.leaseEndDate).toLocaleDateString()}</span>
                          )}
                          {booking.additionalTerms && (
                            <div className="additional-terms">
                              <strong>Additional Terms:</strong>
                              <p>{booking.additionalTerms}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="request-actions">
                      {booking.status === 'Pending Owner Approval' && (
                        <>
                          <button 
                            className="action-btn approve"
                            onClick={() => handleBookingAction(booking.id, 'approve')}
                          >
                            <Check size={16} />
                            Approve Booking
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) {
                                handleBookingAction(booking.id, 'reject', reason);
                              }
                            }}
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'Lease Terms Submitted' && (
                        <>
                          <button 
                            className="action-btn approve"
                            onClick={() => handleBookingAction(booking.id, 'approve-lease')}
                          >
                            <Check size={16} />
                            Approve Lease Terms
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) {
                                handleBookingAction(booking.id, 'reject', reason);
                              }
                            }}
                          >
                            <X size={16} />
                            Reject Terms
                          </button>
                        </>
                      )}

                      <button className="action-btn secondary">
                        <Phone size={16} />
                        Contact Tenant
                      </button>
                      <button className="action-btn secondary">
                        <Eye size={16} />
                        View Full Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="summary-grid">
              <div className="summary-card success">
                <h4>Total Received</h4>
                <strong>₹{payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}</strong>
              </div>
              <div className="summary-card info">
                <h4>This Month</h4>
                <strong>₹{payments.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}</strong>
              </div>
              <div className="summary-card warning">
                <h4>Total Transactions</h4>
                <strong>{payments.length}</strong>
              </div>
            </div>

            {loading ? (
              <div className="loading-message">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="no-data">
                <CreditCard size={48} />
                <h3>No Payments Received</h3>
                <p>Payment history will appear here</p>
              </div>
            ) : (
              <div className="payments-list">
                <h3>Payment History</h3>
                {payments.map(payment => (
                  <div key={payment.id} className="payment-card">
                    <div className="payment-header">
                      <div className="payment-info">
                        <h4>{payment.propertyTitle}</h4>
                        <p>From: {payment.tenantName}</p>
                        <p>{payment.paymentType}</p>
                      </div>
                      <div className="payment-amount">
                        <strong>₹{payment.amount}</strong>
                        <span className={`status-badge ${payment.status.toLowerCase()}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="payment-details">
                      <div className="detail-item">
                        <span className="label">Transaction ID:</span>
                        <span className="value">{payment.transactionId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Payment Method:</span>
                        <span className="value">{payment.paymentMethod}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(payment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {payment.breakdown && (
                      <div className="payment-breakdown">
                        <h5>Breakdown:</h5>
                        <div className="breakdown-details">
                          {JSON.parse(payment.breakdown).rent && (
                            <span>Rent: ₹{JSON.parse(payment.breakdown).rent}</span>
                          )}
                          {JSON.parse(payment.breakdown).electricity && (
                            <span>Electricity: ₹{JSON.parse(payment.breakdown).electricity}</span>
                          )}
                          {JSON.parse(payment.breakdown).water && (
                            <span>Water: ₹{JSON.parse(payment.breakdown).water}</span>
                          )}
                          {JSON.parse(payment.breakdown).garbage && (
                            <span>Garbage: ₹{JSON.parse(payment.breakdown).garbage}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agreements Tab */}
        {activeTab === 'agreements' && (
          <div className="agreements-section">
            {loading ? (
              <div className="loading-message">Loading agreements...</div>
            ) : bookings.filter(b => b.status === 'Agreement Approved' || b.status === 'Active' || b.status === 'Payment Completed').length === 0 ? (
              <div className="no-data">
                <FileText size={48} />
                <h3>No Active Agreements</h3>
                <p>Rental agreements with tenants will appear here</p>
              </div>
            ) : (
              <div className="agreements-list">
                <h3>Active Rental Agreements</h3>
                {bookings.filter(b => b.status === 'Agreement Approved' || b.status === 'Active' || b.status === 'Payment Completed').map(booking => (
                  <div key={booking.id} className="agreement-card">
                    <div className="agreement-header">
                      <div className="tenant-info">
                        <h4>Agreement with {booking.tenantName}</h4>
                        <p>Property: {booking.propertyTitle}</p>
                        <p>Email: {booking.email}</p>
                      </div>
                      <div className="agreement-status">
                        <span className="status-badge success">Active</span>
                      </div>
                    </div>
                    
                    <div className="agreement-details">
                      <div className="detail-item">
                        <span className="label">Lease Duration:</span>
                        <span className="value">{booking.leaseDuration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Monthly Rent:</span>
                        <span className="value">₹{booking.rent}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Security Deposit:</span>
                        <span className="value">₹{booking.deposit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Agreement Date:</span>
                        <span className="value">{booking.agreementDate ? new Date(booking.agreementDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="agreement-actions">
                      <button className="action-btn primary">
                        <FileText size={16} />
                        View Agreement
                      </button>
                      <button className="action-btn secondary">
                        <Phone size={16} />
                        Contact Tenant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="maintenance-section">
            <div className="no-data">
              <MessageSquare size={48} />
              <h3>No Maintenance Requests</h3>
              <p>Tenant maintenance requests will appear here</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {JSON.parse(localStorage.getItem('user') || '{}').fullName?.charAt(0) || 'O'}
                </div>
                <div className="profile-info">
                  <h3>{JSON.parse(localStorage.getItem('user') || '{}').fullName}</h3>
                  <p>{JSON.parse(localStorage.getItem('user') || '{}').email}</p>
                  <span className="role-badge">Owner</span>
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat">
                  <strong>{properties.length}</strong>
                  <span>Total Properties</span>
                </div>
                <div className="stat">
                  <strong>{bookings.filter(b => b.status === 'Active').length}</strong>
                  <span>Active Tenants</span>
                </div>
                <div className="stat">
                  <strong>{payments.length}</strong>
                  <span>Payments Received</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Property Modal */}
        {showAddPropertyModal && (
          <div className="modal-overlay" onClick={() => setShowAddPropertyModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Property</h2>
                <button onClick={() => setShowAddPropertyModal(false)}><X size={24} /></button>
              </div>
              <form className="property-form" onSubmit={handleAddProperty}>
                <div className="input-group">
                  <input type="text" name="title" required placeholder=" " />
                  <label>Property Title *</label>
                </div>
                <div className="input-group">
                  <input type="text" name="address" required placeholder=" " />
                  <label>Full Address *</label>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <select name="type" required>
                      <option value="">Select Type</option>
                      <option>House</option>
                      <option>Apartment</option>
                      <option>Room</option>
                      <option>Studio</option>
                    </select>
                    <label>Property Type *</label>
                  </div>
                  <div className="input-group">
                    <select name="bhk" required>
                      <option value="">Select BHK</option>
                      <option>1BHK</option>
                      <option>2BHK</option>
                      <option>3BHK</option>
                      <option>4BHK+</option>
                    </select>
                    <label>BHK Type *</label>
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <input type="number" name="rent" required placeholder=" " />
                    <label>Monthly Rent (₹) *</label>
                  </div>
                  <div className="input-group">
                    <input type="number" name="deposit" required placeholder=" " />
                    <label>Security Deposit (₹) *</label>
                  </div>
                </div>
                <div className="input-group">
                  <select name="furnishing" required>
                    <option value="">Select Furnishing</option>
                    <option>Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                  <label>Furnishing Status *</label>
                </div>
                <div className="input-group file-group">
                  <input type="file" name="photos" accept="image/*" multiple />
                  <label>Upload Property Photos (Optional)</label>
                  <p className="file-hint">Upload up to 5 photos (JPG, PNG, max 5MB each)</p>
                </div>
                <div className="input-group">
                  <input type="text" name="amenities" placeholder=" " />
                  <label>Amenities (comma-separated, e.g., Parking, WiFi, Security)</label>
                </div>
                <div className="input-group">
                  <textarea name="rules" rows={5} placeholder=" " />
                  <label>Property Rules (e.g., No pets, No smoking)</label>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddPropertyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}