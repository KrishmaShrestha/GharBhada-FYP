import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Heart, Bell, User, CreditCard, FileText, MessageSquare, LogOut, MapPin, Bed, Bath, Zap, Droplet, Trash2, Wifi, Car, Shield, Clock, Download, Plus, CheckCircle, AlertTriangle, Calendar, Eye } from 'lucide-react';
import './TenantDashboard.css';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'Tenant') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData(user.id);
  }, [navigate]);

  const fetchDashboardData = async (tenantId) => {
    try {
      const [propertiesRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/properties'),
        fetch(`http://localhost:5000/api/bookings/tenant/${tenantId}`),
        fetch(`http://localhost:5000/api/payments/tenant/${tenantId}`)
      ]);

      const [propertiesData, bookingsData, paymentsData] = await Promise.all([
        propertiesRes.json(),
        bookingsRes.json(),
        paymentsRes.json()
      ]);

      setProperties(propertiesData.filter(p => p.status === 'Active'));
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

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending Owner Approval': return 'warning';
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

  const getNextAction = (booking) => {
    switch (booking.status) {
      case 'Approved':
        return { text: 'Set Lease Terms', action: () => navigate(`/lease-terms/${booking.id}`) };
      case 'Lease Terms Approved':
        return { text: 'View Agreement', action: () => navigate(`/agreement/${booking.id}`) };
      case 'Agreement Approved':
        return { text: 'Make Payment', action: () => navigate(`/payment/${booking.id}`) };
      case 'Payment Completed':
        return { text: 'Active Rental', action: null };
      case 'Active':
        return { text: 'Pay Monthly Rent', action: () => navigate(`/payment/${booking.id}`) };
      default:
        return { text: 'Waiting', action: null };
    }
  };

  return (
    <div className="tenant-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Home className="logo-icon" />
          <div>
            <h2 className="logo-text">GharBhada</h2>
            <p className="logo-tagline">Tenant Portal</p>
          </div>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'browse', icon: Search, label: 'Browse Properties' },
            { id: 'wishlist', icon: Heart, label: 'Wishlist' },
            { id: 'bookings', icon: Bell, label: 'My Bookings' },
            { id: 'payments', icon: CreditCard, label: 'Payments' },
            { id: 'agreements', icon: FileText, label: 'Agreements' },
            { id: 'complaints', icon: MessageSquare, label: 'Complaints' },
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
              {activeTab === 'browse' && 'Find Your Next Home'}
              {activeTab === 'wishlist' && 'Saved Properties'}
              {activeTab === 'bookings' && 'My Bookings'}
              {activeTab === 'payments' && 'Payments & Bills'}
              {activeTab === 'agreements' && 'Rental Agreements'}
              {activeTab === 'complaints' && 'Maintenance Requests'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="page-subtitle">Welcome back, Tenant!</p>
          </div>

          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-avatar">T</div>
          </div>
        </header>

        {/* Browse Properties */}
        {activeTab === 'browse' && (
          <>
            <div className="filters-card">
              <div className="filters-header">
                <h3>Search Properties</h3>
                <button className="clear-filters">Clear all</button>
              </div>
              <div className="filters-grid">
                <input type="text" placeholder="Location (e.g. Baneshwor)" />
                <select><option>Property Type</option></select>
                <select><option>BHK</option></select>
                <input type="number" placeholder="Min Rent" />
                <input type="number" placeholder="Max Rent" />
                <select><option>Furnishing</option></select>
              </div>
              <button className="search-btn">
                <Search size={18} />
                Search Properties
              </button>
            </div>

            <div className="properties-grid">
              {loading ? (
                <div className="loading-message">Loading properties...</div>
              ) : properties.length === 0 ? (
                <div className="no-data">No properties available</div>
              ) : (
                properties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-image">
                      {property.photos && property.photos.length > 0 ? (
                        <img 
                          src={`http://localhost:5000/uploads/${property.photos[0]}`} 
                          alt={property.title}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <button className="wishlist-btn">
                        <Heart size={20} />
                      </button>
                      {property.verified && (
                        <div className="verified-badge">
                          <Shield size={14} /> Verified
                        </div>
                      )}
                    </div>
                    <div className="property-content">
                      <h3>{property.title}</h3>
                      <p className="location"><MapPin size={16} /> {property.address}</p>
                      <div className="amenities">
                        <span><Bed size={16} /> {property.bhk}</span>
                        <span><Bath size={16} /> {property.furnishing}</span>
                        <span><Wifi size={16} /> WiFi</span>
                      </div>
                      <div className="price-row">
                        <div>
                          <p>Rent</p>
                          <strong>₹{property.rent}</strong>/month
                        </div>
                        <button 
                          className="book-btn"
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* My Bookings */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            {loading ? (
              <div className="loading-message">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="no-data">
                <Bell size={48} />
                <h3>No Bookings Yet</h3>
                <p>Start browsing properties to make your first booking</p>
                <button 
                  className="browse-btn"
                  onClick={() => setActiveTab('browse')}
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => {
                  const nextAction = getNextAction(booking);
                  return (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <div className="property-info">
                          <h3>{booking.propertyTitle}</h3>
                          <p className="address">{booking.propertyAddress}</p>
                          <p className="owner">Owner: {booking.ownerName}</p>
                        </div>
                        <div className="booking-status">
                          <span className={`status-badge ${getBookingStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-item">
                          <span className="label">Monthly Rent:</span>
                          <span className="value">₹{booking.rent}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Security Deposit:</span>
                          <span className="value">₹{booking.deposit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Move-in Date:</span>
                          <span className="value">{new Date(booking.moveInDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Applied On:</span>
                          <span className="value">{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {booking.leaseDuration && (
                        <div className="lease-info">
                          <h4>Lease Details</h4>
                          <div className="lease-details">
                            <span>Duration: {booking.leaseDuration}</span>
                            {booking.leaseStartDate && (
                              <span>Start: {new Date(booking.leaseStartDate).toLocaleDateString()}</span>
                            )}
                            {booking.leaseEndDate && (
                              <span>End: {new Date(booking.leaseEndDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="booking-actions">
                        {nextAction.action && (
                          <button 
                            className="action-btn primary"
                            onClick={nextAction.action}
                          >
                            {nextAction.text}
                          </button>
                        )}
                        <button className="action-btn secondary">
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="summary-grid">
              <div className="summary-card purple">
                <h4>Total Paid This Year</h4>
                <strong>₹{payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}</strong>
              </div>
              <div className="summary-card indigo">
                <h4>Total Payments</h4>
                <strong>{payments.length}</strong>
                <p>Transactions</p>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-message">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="no-data">
                <CreditCard size={48} />
                <h3>No Payments Yet</h3>
                <p>Your payment history will appear here</p>
              </div>
            ) : (
              <div className="payments-list">
                <h3>Payment History</h3>
                {payments.map(payment => (
                  <div key={payment.id} className="payment-card">
                    <div className="payment-header">
                      <div className="payment-info">
                        <h4>{payment.propertyTitle}</h4>
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

        {/* Agreements */}
        {activeTab === 'agreements' && (
          <div className="agreements-section">
            {loading ? (
              <div className="loading-message">Loading agreements...</div>
            ) : bookings.filter(b => b.status === 'Agreement Approved' || b.status === 'Active' || b.status === 'Payment Completed').length === 0 ? (
              <div className="no-data">
                <FileText size={48} />
                <h3>No Agreements Yet</h3>
                <p>Your rental agreements will appear here once approved</p>
              </div>
            ) : (
              <div className="agreements-list">
                <h3>Rental Agreements</h3>
                {bookings.filter(b => b.status === 'Agreement Approved' || b.status === 'Active' || b.status === 'Payment Completed').map(booking => (
                  <div key={booking.id} className="agreement-card">
                    <div className="agreement-header">
                      <div className="property-info">
                        <h4>{booking.propertyTitle}</h4>
                        <p>{booking.propertyAddress}</p>
                        <p>Owner: {booking.ownerName}</p>
                      </div>
                      <div className="agreement-status">
                        <span className="status-badge success">Active Agreement</span>
                      </div>
                    </div>
                    
                    <div className="agreement-details">
                      <div className="detail-item">
                        <span className="label">Lease Duration:</span>
                        <span className="value">{booking.leaseDuration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Start Date:</span>
                        <span className="value">{booking.leaseStartDate ? new Date(booking.leaseStartDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">End Date:</span>
                        <span className="value">{booking.leaseEndDate ? new Date(booking.leaseEndDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Monthly Rent:</span>
                        <span className="value">₹{booking.rent}</span>
                      </div>
                    </div>

                    <div className="agreement-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => navigate(`/agreement/${booking.id}`)}
                      >
                        <FileText size={16} />
                        View Agreement
                      </button>
                      <button className="action-btn secondary">
                        <Download size={16} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complaints */}
        {activeTab === 'complaints' && (
          <div className="complaints-section">
            <div className="section-header">
              <h3>Maintenance Requests</h3>
              <button className="btn-primary">
                <Plus size={16} />
                New Request
              </button>
            </div>
            
            <div className="no-data">
              <MessageSquare size={48} />
              <h3>No Complaints Yet</h3>
              <p>Submit maintenance requests for your rental properties</p>
              <button className="btn-primary">
                <Plus size={16} />
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <div className="no-data">
              <Heart size={48} />
              <h3>No Saved Properties</h3>
              <p>Properties you save will appear here</p>
              <button 
                className="browse-btn"
                onClick={() => setActiveTab('browse')}
              >
                Browse Properties
              </button>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {JSON.parse(localStorage.getItem('user') || '{}').fullName?.charAt(0) || 'T'}
                </div>
                <div className="profile-info">
                  <h3>{JSON.parse(localStorage.getItem('user') || '{}').fullName}</h3>
                  <p>{JSON.parse(localStorage.getItem('user') || '{}').email}</p>
                  <span className="role-badge">Tenant</span>
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat">
                  <strong>{bookings.length}</strong>
                  <span>Total Bookings</span>
                </div>
                <div className="stat">
                  <strong>{bookings.filter(b => b.status === 'Active').length}</strong>
                  <span>Active Rentals</span>
                </div>
                <div className="stat">
                  <strong>{payments.length}</strong>
                  <span>Payments Made</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}