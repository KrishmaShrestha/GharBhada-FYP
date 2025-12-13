import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Wifi, Car, 
  Shield, Zap, Droplet, Trash2, Star, User, Phone, Mail, Calendar,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import './PropertyDetails.css';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Sample property data - replace with API call
  const property = {
    id: 1,
    title: "Cozy 2BHK in Baneshwor",
    location: "Baneshwor, Kathmandu",
    fullAddress: "Ward No. 32, Baneshwor, Kathmandu Metropolitan City",
    rent: 25000,
    deposit: 50000,
    type: "Apartment",
    bhk: "2BHK",
    area: "800 sq ft",
    furnishing: "Semi-Furnished",
    photos: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    amenities: [
      { name: "WiFi", icon: Wifi, available: true },
      { name: "Parking", icon: Car, available: true },
      { name: "Security", icon: Shield, available: true },
      { name: "Water Supply", icon: Droplet, available: true },
      { name: "Electricity Backup", icon: Zap, available: false },
      { name: "Garbage Collection", icon: Trash2, available: true }
    ],
    owner: {
      name: "Ram Sharma",
      trustLevel: "Trusted",
      yearsOnPlatform: 2,
      rating: 4.5,
      totalProperties: 5,
      phone: "+977 9812345678",
      email: "ram.sharma@example.com",
      joinDate: "2022-01-15"
    },
    verified: true,
    available: true,
    description: "Beautiful 2BHK apartment in the heart of Baneshwor. Perfect for small families or working professionals. Close to major shopping centers, hospitals, and educational institutions.",
    rules: [
      "No pets allowed",
      "No smoking inside the property",
      "Visitors allowed until 9 PM",
      "Monthly rent due by 5th of each month",
      "Minimum 1-year lease required"
    ],
    utilities: {
      electricity: "Per unit consumption (NEA rates)",
      water: "NPR 500/month (fixed)",
      garbage: "NPR 300/month (fixed)",
      internet: "Tenant's responsibility"
    },
    nearbyPlaces: [
      "Civil Mall - 5 min walk",
      "Norvic Hospital - 10 min walk",
      "Baneshwor Campus - 15 min walk",
      "Ring Road - 2 min walk"
    ]
  };

  const handleBookNow = () => {
    navigate(`/booking/${property.id}`);
  };

  return (
    <div className="property-details">
      {/* Header */}
      <header className="property-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back to Properties
        </button>
        
        <div className="header-actions">
          <button 
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button className="share-btn">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="image-gallery">
        <div className="main-image">
          <img src={property.photos[currentImageIndex]} alt={property.title} />
          {property.verified && (
            <div className="verified-badge">
              <Shield size={16} />
              Verified Property
            </div>
          )}
        </div>
        
        <div className="image-thumbnails">
          {property.photos.map((photo, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img src={photo} alt={`View ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Property Info */}
      <div className="property-content">
        <div className="property-main">
          <div className="property-title-section">
            <h1>{property.title}</h1>
            <p className="location">
              <MapPin size={18} />
              {property.fullAddress}
            </p>
            
            <div className="property-specs">
              <span className="spec">
                <Bed size={16} />
                {property.bhk}
              </span>
              <span className="spec">
                <Square size={16} />
                {property.area}
              </span>
              <span className="spec">
                <Bath size={16} />
                {property.furnishing}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>About this Property</h3>
            <p>{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="amenities-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {property.amenities.map((amenity, index) => (
                <div key={index} className={`amenity-item ${amenity.available ? 'available' : 'unavailable'}`}>
                  <amenity.icon size={20} />
                  <span>{amenity.name}</span>
                  {amenity.available ? (
                    <CheckCircle size={16} className="status-icon available" />
                  ) : (
                    <AlertTriangle size={16} className="status-icon unavailable" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Utilities */}
          <div className="utilities-section">
            <h3>Utility Charges</h3>
            <div className="utilities-grid">
              <div className="utility-item">
                <Zap size={18} />
                <div>
                  <strong>Electricity</strong>
                  <p>{property.utilities.electricity}</p>
                </div>
              </div>
              <div className="utility-item">
                <Droplet size={18} />
                <div>
                  <strong>Water</strong>
                  <p>{property.utilities.water}</p>
                </div>
              </div>
              <div className="utility-item">
                <Trash2 size={18} />
                <div>
                  <strong>Garbage</strong>
                  <p>{property.utilities.garbage}</p>
                </div>
              </div>
              <div className="utility-item">
                <Wifi size={18} />
                <div>
                  <strong>Internet</strong>
                  <p>{property.utilities.internet}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Rules */}
          <div className="rules-section">
            <h3>Property Rules</h3>
            <ul className="rules-list">
              {property.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Nearby Places */}
          <div className="nearby-section">
            <h3>Nearby Places</h3>
            <ul className="nearby-list">
              {property.nearbyPlaces.map((place, index) => (
                <li key={index}>
                  <MapPin size={14} />
                  {place}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="property-sidebar">
          {/* Price Card */}
          <div className="price-card">
            <div className="price-info">
              <h2>NPR {property.rent.toLocaleString()}<span>/month</span></h2>
              <p>Security Deposit: NPR {property.deposit.toLocaleString()}</p>
            </div>
            
            <div className="availability-status">
              {property.available ? (
                <span className="available">
                  <CheckCircle size={16} />
                  Available Now
                </span>
              ) : (
                <span className="unavailable">
                  <AlertTriangle size={16} />
                  Not Available
                </span>
              )}
            </div>

            <button 
              className="book-now-btn"
              onClick={handleBookNow}
              disabled={!property.available}
            >
              {property.available ? 'Book Now' : 'Not Available'}
            </button>
          </div>

          {/* Owner Info */}
          <div className="owner-card">
            <div className="owner-header">
              <div className="owner-avatar">
                {property.owner.name.charAt(0)}
              </div>
              <div className="owner-info">
                <h4>{property.owner.name}</h4>
                <div className="trust-info">
                  <span className={`trust-badge ${property.owner.trustLevel.toLowerCase()}`}>
                    {property.owner.trustLevel === 'Trusted' ? (
                      <>
                        <Star size={12} fill="currentColor" />
                        Trusted Owner
                      </>
                    ) : (
                      <>
                        <User size={12} />
                        Regular Owner
                      </>
                    )}
                  </span>
                  <span className="rating">
                    <Star size={12} fill="currentColor" />
                    {property.owner.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="owner-stats">
              <div className="stat">
                <strong>{property.owner.yearsOnPlatform}</strong>
                <span>Years on Platform</span>
              </div>
              <div className="stat">
                <strong>{property.owner.totalProperties}</strong>
                <span>Properties Listed</span>
              </div>
            </div>

            <div className="owner-contact">
              <button className="contact-btn">
                <Phone size={16} />
                Contact Owner
              </button>
              <button className="contact-btn secondary">
                <Mail size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}