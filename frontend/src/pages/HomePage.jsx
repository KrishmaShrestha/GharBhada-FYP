import React, { useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: "Gongabu, Kathmandu",
    type: "Room",
    priceRange: ""
  });

  const handleSearch = () => {
    // Navigate to tenant dashboard with search params
    navigate("/tenant/dashboard", { state: { searchData } });
  };

  return (
    <div className="rental-homepage">

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-icon">🏠</span>
            <span className="logo-text">GharBhada</span>
          </div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nav-buttons">
            <button className="btn-signup" onClick={() => navigate("/signup")}>Sign Up</button>
            <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Simplify Your Rental Experience.
              <br />
              <span className="hero-title-highlight">
                Find Homes with Trust and Transparency.
              </span>
            </h1>

            <p className="hero-description">
              A modern digital platform designed to make renting easier, safer, and more reliable for tenants and owners.
            </p>

            <div className="cta-buttons">
              <button className="btn-cta-primary" onClick={() => navigate("/signup", { state: { role: "Tenant" } })}>
                I'm a Tenant
              </button>
              <button className="btn-cta-secondary" onClick={() => navigate("/signup", { state: { role: "Owner" } })}>
                I'm an Owner
              </button>
            </div>

            {/* Search Box */}
            <div className="search-box">
              <div className="search-fields">
                <div className="search-field">
                  <label>Location</label>
                  <input 
                    type="text" 
                    placeholder="Gongabu, Kathmandu"
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                  />
                </div>
                <div className="search-field">
                  <label>Type</label>
                  <select 
                    value={searchData.type}
                    onChange={(e) => setSearchData({...searchData, type: e.target.value})}
                  >
                    <option>Room</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>1BHK</option>
                    <option>2BHK</option>
                    <option>3BHK</option>
                  </select>
                </div>
                <div className="search-field">
                  <label>Price Range</label>
                  <input 
                    type="text" 
                    placeholder="Enter budget"
                    value={searchData.priceRange}
                    onChange={(e) => setSearchData({...searchData, priceRange: e.target.value})}
                  />
                </div>
              </div>

              <button className="btn-search" onClick={handleSearch}>🔍 Search</button>
            </div>
          </div>

          {/* Right Image */}
          <div className="hero-image">
            <img 
              src="https://www.bhg.com/thmb/TD9qUnFen4PBLDuB2hn9yhGXPv8=/1866x0/filters:no_upscale():strip_icc()/white-house-a-frame-section-c0a4a3b3-e722202f114e4aeea4370af6dbb4312b.jpg"
              alt="Rental Property" 
              className="hero-main-image"
            />
            <div className="floating-icon key-icon">🔑</div>
            <div className="floating-icon map-icon">🗺️</div>
            <div className="floating-icon lock-icon">🔒</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="features-container">
          <div className="section-header">
            <h2>How GharBhada Works</h2>
            <p>Three simple user roles for a complete rental ecosystem</p>
          </div>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon admin-icon">👨‍💼</div>
              <h3>Admin</h3>
              <p>Manages the entire system including user verification, property approvals, payment monitoring, and complaint resolution.</p>
              <ul className="role-features">
                <li>✓ Approve/Remove users and properties</li>
                <li>✓ Monitor all transactions</li>
                <li>✓ Handle disputes</li>
                <li>✓ Generate analytics</li>
              </ul>
            </div>

            <div className="role-card">
              <div className="role-icon owner-icon">🏢</div>
              <h3>Owner (Landlord)</h3>
              <p>Property owners can list properties, manage rental agreements, and receive monthly payments securely.</p>
              <ul className="role-features">
                <li>✓ Post property listings</li>
                <li>✓ Manage booking requests</li>
                <li>✓ Digital rental agreements</li>
                <li>✓ Track payments</li>
              </ul>
              <button className="role-btn" onClick={() => navigate("/signup", { state: { role: "Owner" } })}>
                Become an Owner
              </button>
            </div>

            <div className="role-card">
              <div className="role-icon tenant-icon">👤</div>
              <h3>Tenant (Renter)</h3>
              <p>Tenants can search properties, book their ideal home, pay rent online, and raise maintenance complaints.</p>
              <ul className="role-features">
                <li>✓ Search and filter properties</li>
                <li>✓ Send booking requests</li>
                <li>✓ Pay rent online</li>
                <li>✓ Raise complaints</li>
              </ul>
              <button className="role-btn" onClick={() => navigate("/signup", { state: { role: "Tenant" } })}>
                Find a Home
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2>Key Features</h2>
            <p>Everything you need for a seamless rental experience</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✔️</div>
              <h3>Trusted Badge</h3>
              <p>Verified properties and landlords for peace of mind</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Digital Agreement</h3>
              <p>Secure, legally binding contracts online</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Automated Payments</h3>
              <p>Easy rent collection and tracking</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Map Search</h3>
              <p>Find properties in your preferred location</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Maintenance Tracking</h3>
              <p>Track and manage repair requests</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Transactions</h3>
              <p>Safe and encrypted payment gateway integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>GharBhada</h4>
            <p>Making rental housing transparent, secure, and efficient in Nepal.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#features">Features</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@gharbhada.com</p>
            <p>Phone: +977 9712345678</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 GharBhada. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}