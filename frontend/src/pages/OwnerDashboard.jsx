import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Plus, Building2, Bell, User, CreditCard, FileText, MessageSquare, LogOut, 
  Eye, Edit, Trash2, Check, X, MapPin, Shield, Calendar, Phone, Mail, Search,
  Filter, MoreVertical, TrendingUp, DollarSign, Users, Activity, Settings,
  Download, Upload, Star, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import './OwnerDashboard.css';
import { showSuccess, showError, showWarning } from '../utils/toastr';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setProperties([]);
      setBookings([]);
      setPayments([]);
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
        showSuccess(`Booking ${action}d successfully`, 'Booking Updated');
      } else {
        const error = await response.json();
        showError(error.message || `Failed to ${action} booking`, 'Booking Error');
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      showError(`Failed to ${action} booking`, 'Network Error');
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
        showError('User not found. Please login again.', 'Authentication Error');
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
        showWarning('Please fill in all required fields.', 'Validation Error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();

      if (response.ok) {
        showSuccess('Property submitted for approval successfully!', 'Property Added');
        setShowAddPropertyModal(false);
        // Refresh properties data
        fetchDashboardData(user.id);
        // Reset form
        e.target.reset();
      } else {
        console.error('Error response:', responseData);
        showError(responseData.message || 'Failed to add property. Please try again.', 'Property Error');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      showError('Network error. Please check your connection and try again.', 'Connection Error');
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'Active').length,
    pendingApproval: properties.filter(p => p.status === 'Pending').length,
    totalBookings: bookings.length,
    pendingRequests: bookings.filter(b => b.status === 'Pending Owner Approval').length,
    monthlyIncome: properties.filter(p => p.status === 'Active').reduce((sum, p) => sum + (parseFloat(p.rent) || 0), 0),
    totalRevenue: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  };

  return (
    <div className="owner-dashboard-modern">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-left">
          <div className="logo-section" onClick={() => navigate('/')}>
            <Home className="logo-icon" />
            <div>
              <h1 className="logo-title">GharBhada</h1>
              <span className="logo-subtitle">Owner Portal</span>
            </div>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search properties, tenants, bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="navbar-right">
          <button className="icon-btn" title="Notifications">
            <Bell size={20} />
            {bookings.filter(b => b.status === 'Pending Owner Approval').length > 0 && (
              <span className="notification-badge">
                {bookings.filter(b => b.status === 'Pending Owner Approval').length}
              </span>
            )}
          </button>
          
          <button className="icon-btn" title="Settings">
            <Settings size={20} />
          </button>

          <div className="user-menu">
            <div className="user-avatar">
              {JSON.parse(localStorage.getItem('user') || '{}').fullName?.charAt(0) || 'O'}
            </div>
            <div className="user-info">
              <span className="user-name">{JSON.parse(localStorage.getItem('user') || '{}').fullName}</span>
              <span className="user-role">Property Owner</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className="sidebar-nav">
        <nav className="nav-menu">
          {[
            { id: 'overview', icon: Activity, label: 'Overview', badge: null },
            { id: 'properties', icon: Building2, label: 'Properties', badge: properties.length },
            { id: 'requests', icon: Bell, label: 'Requests', badge: stats.pendingRequests },
            { id: 'payments', icon: CreditCard, label: 'Payments', badge: null },
            { id: 'agreements', icon: FileText, label: 'Agreements', badge: null },
            { id: 'maintenance', icon: MessageSquare, label: 'Maintenance', badge: null },
            { id: 'profile', icon: User, label: 'Profile', badge: null },
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge !== null && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Dashboard Overview</h2>
                <p className="section-subtitle">Welcome back! Here's what's happening with your properties.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowAddPropertyModal(true)}>
                <Plus size={18} />
                Add Property
              </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid-modern">
              <div className="stat-card-modern primary">
                <div className="stat-icon">
                  <Building2 size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Properties</span>
                  <h3 className="stat-value">{stats.totalProperties}</h3>
                  <span className="stat-change positive">
                    <TrendingUp size={14} />
                    {stats.activeProperties} Active
                  </span>
                </div>
              </div>

              <div className="stat-card-modern success">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Monthly Income</span>
                  <h3 className="stat-value">₹{stats.monthlyIncome.toLocaleString()}</h3>
                  <span className="stat-change positive">
                    <TrendingUp size={14} />
                    From {stats.activeProperties} properties
                  </span>
                </div>
              </div>

              <div className="stat-card-modern warning">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Booking Requests</span>
                  <h3 className="stat-value">{stats.pendingRequests}</h3>
                  <span className="stat-change">
                    <Clock size={14} />
                    Pending approval
                  </span>
                </div>
              </div>

              <div className="stat-card-modern info">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Revenue</span>
                  <h3 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h3>
                  <span className="stat-change positive">
                    <TrendingUp size={14} />
                    All time
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-header">
                  <h3>Recent Properties</h3>
                  <button className="link-btn" onClick={() => setActiveTab('properties')}>View All</button>
                </div>
                <div className="properties-list-compact">
                  {properties.slice(0, 3).map(property => (
                    <div key={property.id} className="property-item-compact">
                      <div className="property-image-small">
                        {property.photos && property.photos.length > 0 ? (
                          <img src={`http://localhost:5000/uploads/${property.photos[0]}`} alt={property.title} />
                        ) : (
                          <Building2 size={24} />
                        )}
                      </div>
                      <div className="property-details-compact">
                        <h4>{property.title}</h4>
                        <p><MapPin size={14} /> {property.address}</p>
                      </div>
                      <div className="property-status-compact">
                        <span className={`status-badge ${property.status.toLowerCase()}`}>
                          {property.status}
                        </span>
                        <span className="property-rent">₹{property.rent}/mo</span>
                      </div>
                    </div>
                  ))}
                  {properties.length === 0 && (
                    <div className="empty-state-small">
                      <Building2 size={32} />
                      <p>No properties yet</p>
                      <button className="btn-secondary-small" onClick={() => setShowAddPropertyModal(true)}>
                        Add Your First Property
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <h3>Pending Requests</h3>
                  <button className="link-btn" onClick={() => setActiveTab('requests')}>View All</button>
                </div>
                <div className="requests-list-compact">
                  {bookings.filter(b => b.status === 'Pending Owner Approval').slice(0, 3).map(booking => (
                    <div key={booking.id} className="request-item-compact">
                      <div className="request-avatar">
                        {booking.tenantName?.charAt(0) || 'T'}
                      </div>
                      <div className="request-details-compact">
                        <h4>{booking.tenantName}</h4>
                        <p>{booking.propertyTitle}</p>
                      </div>
                      <div className="request-actions-compact">
                        <button 
                          className="btn-icon-success" 
                          onClick={() => handleBookingAction(booking.id, 'approve')}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className="btn-icon-danger" 
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) handleBookingAction(booking.id, 'reject', reason);
                          }}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === 'Pending Owner Approval').length === 0 && (
                    <div className="empty-state-small">
                      <CheckCircle2 size={32} />
                      <p>No pending requests</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="properties-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Properties</h2>
                <p className="section-subtitle">Manage and monitor all your rental properties</p>
              </div>
              <div className="header-actions">
                <div className="filter-group">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <button className="btn-icon" title="Filter">
                    <Filter size={18} />
                  </button>
                </div>
                <button className="btn-primary" onClick={() => setShowAddPropertyModal(true)}>
                  <Plus size={18} />
                  Add Property
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading properties...</p>
              </div>
            ) : (
              <div className="properties-grid-modern">
                {filteredProperties.length === 0 ? (
                  <div className="empty-state">
                    <Building2 size={64} />
                    <h3>No Properties Found</h3>
                    <p>Start by adding your first property to begin earning rental income</p>
                    <button className="btn-primary" onClick={() => setShowAddPropertyModal(true)}>
                      <Plus size={18} />
                      Add Your First Property
                    </button>
                  </div>
                ) : (
                  filteredProperties.map(property => (
                    <div key={property.id} className="property-card-modern">
                      <div className="property-image-container">
                        {property.photos && property.photos.length > 0 ? (
                          <img 
                            src={`http://localhost:5000/uploads/${property.photos[0]}`} 
                            alt={property.title}
                            className="property-image"
                          />
                        ) : (
                          <div className="property-placeholder">
                            <Building2 size={48} />
                          </div>
                        )}
                        <div className="property-badges">
                          {property.verified && (
                            <span className="badge verified">
                              <Shield size={12} />
                              Verified
                            </span>
                          )}
                          <span className={`badge status-${property.status.toLowerCase()}`}>
                            {property.status}
                          </span>
                        </div>
                        <div className="property-actions-overlay">
                          <button className="action-btn-overlay" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn-overlay" title="Edit Property">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn-overlay danger" title="Delete Property">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="property-content">
                        <div className="property-header">
                          <h3 className="property-title">{property.title}</h3>
                          <button className="btn-menu">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                        
                        <div className="property-location">
                          <MapPin size={14} />
                          <span>{property.address}</span>
                        </div>
                        
                        <div className="property-details">
                          <div className="detail-item">
                            <span className="detail-label">Type</span>
                            <span className="detail-value">{property.bhk} {property.type}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Furnishing</span>
                            <span className="detail-value">{property.furnishing}</span>
                          </div>
                        </div>
                        
                        <div className="property-pricing">
                          <div className="price-item">
                            <span className="price-label">Monthly Rent</span>
                            <span className="price-value">₹{property.rent?.toLocaleString()}</span>
                          </div>
                          <div className="price-item">
                            <span className="price-label">Security Deposit</span>
                            <span className="price-value">₹{property.deposit?.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="property-footer">
                          <div className="property-stats">
                            <span className="stat-item">
                              <Eye size={12} />
                              {Math.floor(Math.random() * 100)} views
                            </span>
                            <span className="stat-item">
                              <Calendar size={12} />
                              Listed {new Date(property.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Booking Requests Tab */}
        {activeTab === 'requests' && (
          <div className="requests-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Booking Requests</h2>
                <p className="section-subtitle">Review and manage tenant applications</p>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading requests...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <Bell size={64} />
                <h3>No Booking Requests</h3>
                <p>Tenant applications will appear here when they apply for your properties</p>
              </div>
            ) : (
              <div className="requests-grid">
                {bookings.map(booking => (
                  <div key={booking.id} className="request-card-modern">
                    <div className="request-header">
                      <div className="tenant-profile">
                        <div className="tenant-avatar-large">
                          {booking.tenantName?.charAt(0) || 'T'}
                        </div>
                        <div className="tenant-info">
                          <h3>{booking.tenantName}</h3>
                          <p>{booking.email}</p>
                          <p>{booking.phone}</p>
                        </div>
                      </div>
                      <div className="request-status-section">
                        <span className={`status-badge-large ${getBookingStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="request-date">
                          Applied {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="property-info-card">
                      <h4>Property: {booking.propertyTitle}</h4>
                      <p><MapPin size={14} /> {booking.propertyAddress}</p>
                      <div className="booking-financial">
                        <span>Rent: ₹{booking.rent}</span>
                        <span>Deposit: ₹{booking.deposit}</span>
                        <span>Move-in: {new Date(booking.moveInDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="tenant-details-grid">
                      <div className="detail-card">
                        <span className="detail-label">Occupation</span>
                        <span className="detail-value">{booking.occupation}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Monthly Income</span>
                        <span className="detail-value">₹{booking.monthlyIncome}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Family Size</span>
                        <span className="detail-value">{booking.familySize}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Emergency Contact</span>
                        <span className="detail-value">{booking.emergencyContactName}</span>
                      </div>
                    </div>

                    {booking.status === 'Pending Owner Approval' && (
                      <div className="request-actions-section">
                        <button 
                          className="btn-success"
                          onClick={() => handleBookingAction(booking.id, 'approve')}
                        >
                          <Check size={16} />
                          Approve Application
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => {
                            const reason = prompt('Please provide a reason for rejection:');
                            if (reason) handleBookingAction(booking.id, 'reject', reason);
                          }}
                        >
                          <X size={16} />
                          Reject
                        </button>
                        <button className="btn-secondary">
                          <Phone size={16} />
                          Contact Tenant
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs with modern design */}
        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Payment History</h2>
                <p className="section-subtitle">Track all rental payments and transactions</p>
              </div>
              <button className="btn-secondary">
                <Download size={16} />
                Export Report
              </button>
            </div>
            
            <div className="payments-summary">
              <div className="summary-card">
                <h4>Total Received</h4>
                <span className="amount">₹{payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}</span>
              </div>
              <div className="summary-card">
                <h4>This Month</h4>
                <span className="amount">₹{payments.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}</span>
              </div>
              <div className="summary-card">
                <h4>Transactions</h4>
                <span className="amount">{payments.length}</span>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={64} />
                <h3>No Payments Yet</h3>
                <p>Payment history will appear here once tenants start making payments</p>
              </div>
            ) : (
              <div className="payments-table">
                {payments.map(payment => (
                  <div key={payment.id} className="payment-row">
                    <div className="payment-info">
                      <h4>{payment.propertyTitle}</h4>
                      <p>From: {payment.tenantName}</p>
                      <span className="payment-type">{payment.paymentType}</span>
                    </div>
                    <div className="payment-details">
                      <span className="payment-amount">₹{payment.amount}</span>
                      <span className="payment-date">{new Date(payment.createdAt).toLocaleDateString()}</span>
                      <span className={`payment-status ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Profile Settings</h2>
                <p className="section-subtitle">Manage your account information and preferences</p>
              </div>
            </div>
            
            <div className="profile-content">
              <div className="profile-card-modern">
                <div className="profile-header-section">
                  <div className="profile-avatar-large">
                    {JSON.parse(localStorage.getItem('user') || '{}').fullName?.charAt(0) || 'O'}
                  </div>
                  <div className="profile-info-section">
                    <h3>{JSON.parse(localStorage.getItem('user') || '{}').fullName}</h3>
                    <p>{JSON.parse(localStorage.getItem('user') || '{}').email}</p>
                    <span className="role-badge-large">Property Owner</span>
                  </div>
                </div>
                
                <div className="profile-stats-grid">
                  <div className="profile-stat">
                    <span className="stat-number">{properties.length}</span>
                    <span className="stat-label">Properties Listed</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{bookings.filter(b => b.status === 'Active').length}</span>
                    <span className="stat-label">Active Tenants</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{payments.length}</span>
                    <span className="stat-label">Payments Received</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Property Modal */}
        {showAddPropertyModal && (
          <div className="modal-overlay-modern" onClick={() => setShowAddPropertyModal(false)}>
            <div className="modal-modern" onClick={e => e.stopPropagation()}>
              <div className="modal-header-modern">
                <h2>Add New Property</h2>
                <button className="modal-close" onClick={() => setShowAddPropertyModal(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <form className="property-form-modern" onSubmit={handleAddProperty}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Property Title *</label>
                    <input type="text" name="title" required placeholder="e.g., Spacious 2BHK Apartment" />
                  </div>
                  
                  <div className="form-group">
                    <label>Full Address *</label>
                    <input type="text" name="address" required placeholder="e.g., Baneshwor, Kathmandu" />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Property Type *</label>
                      <select name="type" required>
                        <option value="">Select Type</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Room">Room</option>
                        <option value="Studio">Studio</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>BHK Type *</label>
                      <select name="bhk" required>
                        <option value="">Select BHK</option>
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="4BHK+">4BHK+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Monthly Rent (₹) *</label>
                      <input type="number" name="rent" required placeholder="25000" />
                    </div>
                    
                    <div className="form-group">
                      <label>Security Deposit (₹) *</label>
                      <input type="number" name="deposit" required placeholder="50000" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Furnishing Status *</label>
                    <select name="furnishing" required>
                      <option value="">Select Furnishing</option>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Property Photos</label>
                    <input type="file" name="photos" accept="image/*" multiple />
                    <p className="form-hint">Upload up to 5 photos (JPG, PNG, max 5MB each)</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Amenities</label>
                    <input type="text" name="amenities" placeholder="Parking, WiFi, Security, Gym" />
                    <p className="form-hint">Separate multiple amenities with commas</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Property Rules</label>
                    <textarea name="rules" rows={4} placeholder="No pets, No smoking, No parties after 10 PM"></textarea>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddPropertyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Upload size={16} />
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