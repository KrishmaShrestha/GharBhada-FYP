import React, { useState } from 'react';
import { Home, Search, Heart, Bell, User, CreditCard, FileText, MessageSquare, LogOut, MapPin, Bed, Bath, Zap, Droplet, Trash2, Wifi, Car, Shield, Clock, Download, Plus } from 'lucide-react';
import './TenantDashboard.css';

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState('browse');

  const properties = [ /* your data */ ];
  const bookings = [ /* your data */ ];
  const payments = [ /* your data */ ];
  const complaints = [ /* your data */ ];

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

        <button className="logout-btn">
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
              {/* Property Card */}
              <div className="property-card">
                <div className="property-image">
                  <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Property" />
                  <button className="wishlist-btn">
                    <Heart size={20} fill="currentColor" />
                  </button>
                  <div className="verified-badge">
                    <Shield size={14} /> Verified
                  </div>
                </div>
                <div className="property-content">
                  <h3>Cozy 2BHK in Baneshwor</h3>
                  <p className="location"><MapPin size={16} /> Baneshwor, Kathmandu</p>
                  <div className="amenities">
                    <span><Bed size={16} /> 2 Beds</span>
                    <span><Bath size={16} /> 1 Bath</span>
                    <span><Wifi size={16} /> WiFi</span>
                  </div>
                  <div className="price-row">
                    <div>
                      <p>Rent</p>
                      <strong>NPR 25,000</strong>/month
                    </div>
                    <button className="book-btn">Book Now</button>
                  </div>
                </div>
              </div>
              {/* Repeat cards */}
            </div>
          </>
        )}

        {/* Other tabs content (same clean style) */}
        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="summary-grid">
              <div className="summary-card purple">
                <h4>Total Paid This Year</h4>
                <strong>NPR 168,000</strong>
              </div>
              <div className="summary-card indigo">
                <h4>Next Due</h4>
                <strong>NPR 28,300</strong>
                <p>Due Dec 5, 2024</p>
              </div>
            </div>
            {/* Payment list */}
          </div>
        )}
      </main>
    </div>
  );
}