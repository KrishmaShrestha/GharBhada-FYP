import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Heart, Bell, User, CreditCard, FileText, MessageSquare, LogOut, 
  MapPin, Bed, Bath, Zap, Droplet, Trash2, Wifi, Car, Shield, Clock, Download, 
  Plus, CheckCircle, AlertTriangle, Calendar, Eye, Filter, Star, TrendingUp, 
  DollarSign, Users, Activity, Settings, MoreVertical, Phone, Mail, Building2
} from 'lucide-react';
import './TenantDashboard.css';
import { showSuccess, showError, showWarning } from '../utils/toastr';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    bhk: '',
    minRent: '',
    maxRent: '',
    furnishing: ''
  });

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

      setProperties(Array.isArray(propertiesData) ? propertiesData.filter(p => p.status === 'Active') : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // Load wishlist from localStorage
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(savedWishlist);
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

  const toggleWishlist = (propertyId) => {
    const newWishlist = wishlist.includes(propertyId) 
      ? wishlist.filter(id => id !== propertyId)
      : [...wishlist, propertyId];
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    const message = wishlist.includes(propertyId) 
      ? 'Removed from wishlist' 
      : 'Added to wishlist';
    showSuccess(message, 'Wishlist Updated');
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !filters.location || 
                           property.address?.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesType = !filters.type || property.type === filters.type;
    const matchesBhk = !filters.bhk || property.bhk === filters.bhk;
    const matchesFurnishing = !filters.furnishing || property.furnishing === filters.furnishing;
    
    const matchesRent = (!filters.minRent || property.rent >= parseInt(filters.minRent)) &&
                       (!filters.maxRent || property.rent <= parseInt(filters.maxRent));
    
    return matchesSearch && matchesLocation && matchesType && matchesBhk && 
           matchesFurnishing && matchesRent;
  });

  const stats = {
    totalProperties: properties.length,
    wishlistCount: wishlist.length,
    activeBookings: bookings.filter(b => b.status === 'Active').length,
    totalBookings: bookings.length,
    pendingApplications: bookings.filter(b => b.status === 'Pending Owner Approval').length,
    totalPayments: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  };

  return (
    <div className="tenant-dashboard-modern">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-left">
          <div className="logo-section" onClick={() => navigate('/')}>
            <Home className="logo-icon" />
            <div>
              <h1 className="logo-title">GharBhada</h1>
              <span className="logo-subtitle">Tenant Portal</span>
            </div>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search properties, locations, amenities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="navbar-right">
          <button className="icon-btn" title="Notifications">
            <Bell size={20} />
            {bookings.filter(b => b.status === 'Approved' || b.status === 'Lease Terms Approved').length > 0 && (
              <span className="notification-badge">
                {bookings.filter(b => b.status === 'Approved' || b.status === 'Lease Terms Approved').length}
              </span>
            )}
          </button>
          
          <button className="icon-btn" title="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="notification-badge">{wishlist.length}</span>
            )}
          </button>

          <button className="icon-btn" title="Settings">
            <Settings size={20} />
          </button>

          <div className="user-menu">
            <div className="user-avatar">
              {JSON.parse(localStorage.getItem('user') || '{}').fullName?.charAt(0) || 'T'}
            </div>
            <div className="user-info">
              <span className="user-name">{JSON.parse(localStorage.getItem('user') || '{}').fullName}</span>
              <span className="user-role">Tenant</span>
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
            { id: 'browse', icon: Search, label: 'Browse Properties', badge: properties.length },
            { id: 'wishlist', icon: Heart, label: 'Wishlist', badge: wishlist.length },
            { id: 'bookings', icon: Bell, label: 'My Applications', badge: stats.pendingApplications },
            { id: 'payments', icon: CreditCard, label: 'Payments', badge: null },
            { id: 'agreements', icon: FileText, label: 'Agreements', badge: null },
            { id: 'complaints', icon: MessageSquare, label: 'Complaints', badge: null },
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
                <p className="section-subtitle">Welcome back! Find your perfect home with ease.</p>
              </div>
              <button className="btn-primary" onClick={() => setActiveTab('browse')}>
                <Search size={18} />
                Browse Properties
              </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid-modern">
              <div className="stat-card-modern primary">
                <div className="stat-icon">
                  <Building2 size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Available Properties</span>
                  <h3 className="stat-value">{stats.totalProperties}</h3>
                  <span className="stat-change positive">
                    <TrendingUp size={14} />
                    Ready to rent
                  </span>
                </div>
              </div>

              <div className="stat-card-modern success">
                <div className="stat-icon">
                  <Heart size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Wishlist Items</span>
                  <h3 className="stat-value">{stats.wishlistCount}</h3>
                  <span className="stat-change">
                    <Heart size={14} />
                    Saved properties
                  </span>
                </div>
              </div>

              <div className="stat-card-modern warning">
                <div className="stat-icon">
                  <Bell size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Applications</span>
                  <h3 className="stat-value">{stats.totalBookings}</h3>
                  <span className="stat-change">
                    <Clock size={14} />
                    {stats.pendingApplications} pending
                  </span>
                </div>
              </div>

              <div className="stat-card-modern info">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Payments</span>
                  <h3 className="stat-value">₹{stats.totalPayments.toLocaleString()}</h3>
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
                  <h3>Featured Properties</h3>
                  <button className="link-btn" onClick={() => setActiveTab('browse')}>View All</button>
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
                        <span className="property-rent">₹{property.rent}/mo</span>
                        <button 
                          className={`wishlist-btn-small ${wishlist.includes(property.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(property.id)}
                        >
                          <Heart size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {properties.length === 0 && (
                    <div className="empty-state-small">
                      <Building2 size={32} />
                      <p>No properties available</p>
                      <button className="btn-secondary-small" onClick={() => setActiveTab('browse')}>
                        Browse Properties
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <h3>Recent Applications</h3>
                  <button className="link-btn" onClick={() => setActiveTab('bookings')}>View All</button>
                </div>
                <div className="applications-list-compact">
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="application-item-compact">
                      <div className="application-icon">
                        <Building2 size={20} />
                      </div>
                      <div className="application-details-compact">
                        <h4>{booking.propertyTitle}</h4>
                        <p>Applied {new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="application-status-compact">
                        <span className={`status-badge ${getBookingStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="empty-state-small">
                      <Bell size={32} />
                      <p>No applications yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Browse Properties Tab */}
        {activeTab === 'browse' && (
          <div className="browse-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Browse Properties</h2>
                <p className="section-subtitle">Find your perfect home from our verified listings</p>
              </div>
              <div className="header-actions">
                <button className="btn-icon" title="Advanced Filters">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="filters-card">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Baneshwor, Kathmandu"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>
                <div className="filter-group">
                  <label>Property Type</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Room">Room</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>BHK</label>
                  <select 
                    value={filters.bhk}
                    onChange={(e) => setFilters({...filters, bhk: e.target.value})}
                  >
                    <option value="">All BHK</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK+">4BHK+</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Min Rent</label>
                  <input 
                    type="number" 
                    placeholder="₹10,000"
                    value={filters.minRent}
                    onChange={(e) => setFilters({...filters, minRent: e.target.value})}
                  />
                </div>
                <div className="filter-group">
                  <label>Max Rent</label>
                  <input 
                    type="number" 
                    placeholder="₹50,000"
                    value={filters.maxRent}
                    onChange={(e) => setFilters({...filters, maxRent: e.target.value})}
                  />
                </div>
                <div className="filter-group">
                  <label>Furnishing</label>
                  <select 
                    value={filters.furnishing}
                    onChange={(e) => setFilters({...filters, furnishing: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
              <div className="filters-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setFilters({location: '', type: '', bhk: '', minRent: '', maxRent: '', furnishing: ''})}
                >
                  Clear Filters
                </button>
                <span className="results-count">{filteredProperties.length} properties found</span>
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
                    <Search size={64} />
                    <h3>No Properties Found</h3>
                    <p>Try adjusting your search filters to find more properties</p>
                    <button 
                      className="btn-primary"
                      onClick={() => setFilters({location: '', type: '', bhk: '', minRent: '', maxRent: '', furnishing: ''})}
                    >
                      Clear All Filters
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
                        </div>
                        <div className="property-actions-overlay">
                          <button 
                            className={`wishlist-btn-overlay ${wishlist.includes(property.id) ? 'active' : ''}`}
                            onClick={() => toggleWishlist(property.id)}
                            title={wishlist.includes(property.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart size={16} />
                          </button>
                          <button className="action-btn-overlay" title="View Details">
                            <Eye size={16} />
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
                        
                        <div className="property-amenities">
                          {property.amenities && (
                            <div className="amenities-list">
                              {property.amenities.split(',').slice(0, 3).map((amenity, index) => (
                                <span key={index} className="amenity-tag">
                                  {amenity.trim()}
                                </span>
                              ))}
                              {property.amenities.split(',').length > 3 && (
                                <span className="amenity-tag more">
                                  +{property.amenities.split(',').length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="property-footer">
                          <button 
                            className="btn-primary-full"
                            onClick={() => navigate(`/booking/${property.id}`)}
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Wishlist</h2>
                <p className="section-subtitle">Properties you've saved for later</p>
              </div>
            </div>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <Heart size={64} />
                <h3>Your Wishlist is Empty</h3>
                <p>Start browsing properties and save your favorites here</p>
                <button className="btn-primary" onClick={() => setActiveTab('browse')}>
                  <Search size={18} />
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="properties-grid-modern">
                {properties.filter(p => wishlist.includes(p.id)).map(property => (
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
                      <div className="property-actions-overlay">
                        <button 
                          className="wishlist-btn-overlay active"
                          onClick={() => toggleWishlist(property.id)}
                          title="Remove from wishlist"
                        >
                          <Heart size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="property-content">
                      <div className="property-header">
                        <h3 className="property-title">{property.title}</h3>
                      </div>
                      
                      <div className="property-location">
                        <MapPin size={14} />
                        <span>{property.address}</span>
                      </div>
                      
                      <div className="property-pricing">
                        <div className="price-item">
                          <span className="price-label">Monthly Rent</span>
                          <span className="price-value">₹{property.rent?.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="property-footer">
                        <button 
                          className="btn-primary-full"
                          onClick={() => navigate(`/booking/${property.id}`)}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Applications</h2>
                <p className="section-subtitle">Track your rental applications and their status</p>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <Bell size={64} />
                <h3>No Applications Yet</h3>
                <p>Start applying for properties to see your applications here</p>
                <button className="btn-primary" onClick={() => setActiveTab('browse')}>
                  <Search size={18} />
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-card-modern">
                    <div className="booking-header">
                      <div className="property-info">
                        <h3>{booking.propertyTitle}</h3>
                        <p><MapPin size={14} /> {booking.propertyAddress}</p>
                      </div>
                      <div className="booking-status-section">
                        <span className={`status-badge-large ${getBookingStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="booking-date">
                          Applied {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="booking-details-card">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Monthly Rent</span>
                          <span className="detail-value">₹{booking.rent}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Security Deposit</span>
                          <span className="detail-value">₹{booking.deposit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Move-in Date</span>
                          <span className="detail-value">{new Date(booking.moveInDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Application Date</span>
                          <span className="detail-value">{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-actions-section">
                      {(() => {
                        const nextAction = getNextAction(booking);
                        return nextAction.action ? (
                          <button className="btn-primary" onClick={nextAction.action}>
                            {nextAction.text}
                          </button>
                        ) : (
                          <span className="status-text">{nextAction.text}</span>
                        );
                      })()}
                      
                      <button className="btn-secondary">
                        <Eye size={16} />
                        View Details
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
            <div className="section-header">
              <div>
                <h2 className="section-title">Payment History</h2>
                <p className="section-subtitle">Track all your rental payments and transactions</p>
              </div>
              <button className="btn-secondary">
                <Download size={16} />
                Export Report
              </button>
            </div>
            
            <div className="payments-summary">
              <div className="summary-card">
                <h4>Total Paid</h4>
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
                <p>Your payment history will appear here once you start making payments</p>
              </div>
            ) : (
              <div className="payments-table">
                {payments.map(payment => (
                  <div key={payment.id} className="payment-row">
                    <div className="payment-info">
                      <h4>{payment.propertyTitle}</h4>
                      <p>To: {payment.ownerName}</p>
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

        {/* Profile Tab */}
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
                    {JSON.parse(localStorage.getItem('user') || '{}').fullName?.charAt(0) || 'T'}
                  </div>
                  <div className="profile-info-section">
                    <h3>{JSON.parse(localStorage.getItem('user') || '{}').fullName}</h3>
                    <p>{JSON.parse(localStorage.getItem('user') || '{}').email}</p>
                    <span className="role-badge-large">Tenant</span>
                  </div>
                </div>
                
                <div className="profile-stats-grid">
                  <div className="profile-stat">
                    <span className="stat-number">{bookings.length}</span>
                    <span className="stat-label">Applications Submitted</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{wishlist.length}</span>
                    <span className="stat-label">Wishlist Items</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{payments.length}</span>
                    <span className="stat-label">Payments Made</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs (agreements, complaints) with placeholder content */}
        {activeTab === 'agreements' && (
          <div className="agreements-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Rental Agreements</h2>
                <p className="section-subtitle">View and manage your rental agreements</p>
              </div>
            </div>
            <div className="empty-state">
              <FileText size={64} />
              <h3>No Active Agreements</h3>
              <p>Your rental agreements will appear here once approved</p>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="complaints-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Maintenance Requests</h2>
                <p className="section-subtitle">Submit and track maintenance requests</p>
              </div>
            </div>
            <div className="empty-state">
              <MessageSquare size={64} />
              <h3>No Maintenance Requests</h3>
              <p>Submit maintenance requests for your rental property here</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}