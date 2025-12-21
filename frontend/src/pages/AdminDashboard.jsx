import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { showSuccess, showError } from '../utils/toastr';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, propertiesRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/users'),
        fetch('http://localhost:5000/api/properties'),
        fetch('http://localhost:5000/api/bookings'),
        fetch('http://localhost:5000/api/payments')
      ]);

      const [usersData, propertiesData, bookingsData, paymentsData] = await Promise.all([
        usersRes.json(),
        propertiesRes.json(),
        bookingsRes.json(),
        paymentsRes.json()
      ]);

      setUsers(usersData);
      setProperties(propertiesData);
      setBookings(bookingsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status } : user
        ));
        showSuccess(`User ${status.toLowerCase()} successfully`, 'User Updated');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showError('Failed to update user status', 'Update Error');
    }
  };

  const handlePropertyStatusUpdate = async (propertyId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setProperties(properties.map(property => 
          property.id === propertyId ? { ...property, status } : property
        ));
        showSuccess(`Property ${status.toLowerCase()} successfully`, 'Property Updated');
      }
    } catch (error) {
      console.error('Error updating property status:', error);
      showError('Failed to update property status', 'Update Error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    pendingUsers: users.filter(u => u.status === 'Pending').length,
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'Active').length,
    pendingProperties: properties.filter(p => p.status === 'Pending').length,
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => b.status === 'Active').length,
    totalPayments: payments.length,
    totalRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>GharBhada Platform Management</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button 
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-details">
                  <span className="active">Active: {stats.activeUsers}</span>
                  <span className="pending">Pending: {stats.pendingUsers}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Properties</h3>
                <div className="stat-number">{stats.totalProperties}</div>
                <div className="stat-details">
                  <span className="active">Active: {stats.activeProperties}</span>
                  <span className="pending">Pending: {stats.pendingProperties}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Bookings</h3>
                <div className="stat-number">{stats.totalBookings}</div>
                <div className="stat-details">
                  <span className="active">Active: {stats.activeBookings}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <div className="stat-number">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-details">
                  <span>From {stats.totalPayments} payments</span>
                </div>
              </div>
            </div>

            <div className="recent-activities">
              <h3>Recent Activities</h3>
              <div className="activity-list">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="activity-item">
                    <div className="activity-info">
                      <p><strong>{booking.tenantName}</strong> booked <strong>{booking.propertyTitle}</strong></p>
                      <span className="activity-time">{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`status ${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h3>User Management</h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {user.status === 'Pending' && (
                            <button 
                              onClick={() => handleUserStatusUpdate(user.id, 'Active')}
                              className="btn-approve"
                            >
                              Approve
                            </button>
                          )}
                          {user.status === 'Active' && (
                            <button 
                              onClick={() => handleUserStatusUpdate(user.id, 'Suspended')}
                              className="btn-suspend"
                            >
                              Suspend
                            </button>
                          )}
                          {user.status === 'Suspended' && (
                            <button 
                              onClick={() => handleUserStatusUpdate(user.id, 'Active')}
                              className="btn-activate"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="properties-section">
            <h3>Property Management</h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => (
                    <tr key={property.id}>
                      <td>{property.title}</td>
                      <td>{property.ownerName}</td>
                      <td>{property.bhk} {property.type}</td>
                      <td>₹{property.rent}</td>
                      <td>
                        <span className={`status ${property.status.toLowerCase()}`}>
                          {property.status}
                        </span>
                      </td>
                      <td>{new Date(property.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {property.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handlePropertyStatusUpdate(property.id, 'Active')}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handlePropertyStatusUpdate(property.id, 'Rejected')}
                                className="btn-reject"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {property.status === 'Active' && (
                            <button 
                              onClick={() => handlePropertyStatusUpdate(property.id, 'Inactive')}
                              className="btn-suspend"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h3>Booking Management</h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Tenant</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Move-in Date</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.propertyTitle}</td>
                      <td>{booking.tenantName}</td>
                      <td>{booking.ownerName}</td>
                      <td>
                        <span className={`status ${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{new Date(booking.moveInDate).toLocaleDateString()}</td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-section">
            <h3>Payment Management</h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{payment.transactionId}</td>
                      <td>{payment.tenantName}</td>
                      <td>{payment.propertyTitle}</td>
                      <td>{payment.paymentType}</td>
                      <td>₹{payment.amount}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>
                        <span className={`status ${payment.status.toLowerCase()}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;