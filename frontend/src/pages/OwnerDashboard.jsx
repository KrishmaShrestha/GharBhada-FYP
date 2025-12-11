import React, { useState } from 'react';
import { Home, Plus, Building2, Bell, User, CreditCard, FileText, MessageSquare, LogOut, Eye, Edit, Trash2, Check, X, MapPin, Shield } from 'lucide-react';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('properties');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  // Sample data only for Properties tab
  const properties = [
    { id: 1, title: "2BHK Cozy Flat", location: "Baneshwor, Kathmandu", rent: 25000, deposit: 50000, status: "Active", occupancyStatus: "Occupied", tenantName: "Ram Thapa" },
    { id: 2, title: "3BHK Modern Apartment", location: "Lazimpat, Kathmandu", rent: 45000, deposit: 90000, status: "Active", occupancyStatus: "Vacant" },
    { id: 3, title: "1BHK Studio Room", location: "Koteshwor, Kathmandu", rent: 15000, deposit: 30000, status: "Pending", occupancyStatus: "Vacant" },
  ];

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
                <strong>12</strong>
              </div>
              <div className="stat-card success">
                <h4>Occupied</h4>
                <strong>8</strong>
              </div>
              <div className="stat-card warning">
                <h4>Vacant</h4>
                <strong>4</strong>
              </div>
              <div className="stat-card income">
                <h4>Monthly Income</h4>
                <strong>NPR 2,00,000</strong>
              </div>
            </div>

            <div className="properties-grid">
              {properties.map(p => (
                <div key={p.id} className="property-card">
                  <div className="property-image">
                    <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt={p.title} />
                    <div className="verified-badge"><Shield size={14} /> Verified</div>
                  </div>
                  <div className="property-content">
                    <div className="property-header">
                      <div>
                        <h3>{p.title}</h3>
                        <p className="location"><MapPin size={16} /> {p.location}</p>
                      </div>
                      <div className="badges">
                        <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
                        <span className={`occupancy ${p.occupancyStatus.toLowerCase()}`}>{p.occupancyStatus}</span>
                      </div>
                    </div>
                    <div className="property-info">
                      <span>Rent: <strong>NPR {p.rent.toLocaleString()}/mo</strong></span>
                      <span>Deposit: <strong>NPR {p.deposit.toLocaleString()}</strong></span>
                      {p.tenantName && <span>Tenant: <strong>{p.tenantName}</strong></span>}
                    </div>
                    <div className="property-actions">
                      <button className="action-btn"><Eye size={18} /> View</button>
                      <button className="action-btn"><Edit size={18} /> Edit</button>
                      <button className="action-btn danger"><Trash2 size={18} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Booking Requests Tab — Completely Empty */}
        {activeTab === 'requests' && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '18px' }}>
            {/* Intentionally left blank */}
          </div>
        )}

        {/* Add Property Modal — 100% Untouched */}
        {showAddPropertyModal && (
          <div className="modal-overlay" onClick={() => setShowAddPropertyModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Property</h2>
                <button onClick={() => setShowAddPropertyModal(false)}><X size={24} /></button>
              </div>
              <form className="property-form">
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
                      <option>Flat</option>
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Room</option>
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
                    <label>Monthly Rent (NPR) *</label>
                  </div>
                  <div className="input-group">
                    <input type="number" name="deposit" required placeholder=" " />
                    <label>Security Deposit (NPR) *</label>
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
                  <input type="file" name="photos" accept="image/*" multiple required />
                  <label>Upload Property Photos *</label>
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