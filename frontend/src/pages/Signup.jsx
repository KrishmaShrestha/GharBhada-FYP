import React, { useState, useEffect } from "react";
import "./Signup.css";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastr";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "", dob: "",
    citizenshipNumber: "", idFile: null, role: "", password: "", confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.state?.role) {
      setFormData(prev => ({ ...prev, role: location.state.role }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    if (e.target.name === "idFile") {
      setFormData({ ...formData, idFile: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(98|97)\d{8}$/;

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) newErrors.phone = "Must be a valid Nepali number (98/97...)";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be 6+ characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.role) newErrors.role = "Please select your role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const form = new FormData();
      for (let key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          form.append(key, formData[key]);
        }
      }
      
      const response = await fetch("http://localhost:5000/api/auth/signup", { 
        method: "POST", 
        body: form 
      });

      const data = await response.json();
      setLoading(false);
      
      if (response.ok && (data.message === "User registered successfully" || data.success)) {
        showSuccess("Account created! Please wait for admin approval.", "Signup Successful");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showError(data.message || "Signup failed", "Signup Error");
      }
    } catch (error) {
      setLoading(false);
      showError("Server error. Please check your connection and try again.", "Connection Error");
    }
  };

  return (
    <div className="signup-fullscreen">
      <div className="signup-container">
        {/* Left: Hero */}
        <div className="signup-hero-side">
          <div className="hero-content">
            <h2>Join GharBhada Today</h2>
            <p>Create your account and start renting or listing properties with full trust and security.</p>
            <div className="features">
              <div>Verified Listings</div>
              <div>Digital Contracts</div>
              <div>Secure Payments</div>
              <div>24/7 Support</div>
            </div>
            <div className="contact-support">
              Need help? Call <strong>+977 9712345678</strong>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="signup-form-side">
          <div className="signup-card">
            <div className="logo" onClick={() => navigate("/")}>
              <span className="logo-text">GharBhada</span>
              <span className="tagline">Find Your Perfect Home</span>
            </div>

            <h1>Create Your Account</h1>
            <p className="subtitle">Join thousands of tenants & owners in Nepal</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <label>Full Name *</label>
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </div>

              <div className="input-row">
                <div className="input-group">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  <label>Email Address *</label>
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="input-group">
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                  <label>Phone Number (98/97...) *</label>
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
              </div>

              <div className="input-group">
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
                <label>Permanent Address</label>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                  <label>Date of Birth</label>
                </div>
                <div className="input-group">
                  <input type="text" name="citizenshipNumber" value={formData.citizenshipNumber} onChange={handleChange} />
                  <label>Citizenship Number</label>
                </div>
              </div>

              <div className="input-group file-group">
                <input type="file" name="idFile" accept="image/*,.pdf" onChange={handleChange} required />
                <label className="file-label">Upload ID Proof (Citizenship/Passport) *</label>
                <p className="file-hint">JPG, PNG, PDF • Max 5MB</p>
              </div>

              <div className="input-group">
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="">-- Select Role --</option>
                  <option value="Tenant">Tenant (Looking to rent)</option>
                  <option value="Owner">Owner (Have property to rent)</option>
                </select>
                <label>Who are you? *</label>
                {errors.role && <span className="error">{errors.role}</span>}
              </div>

              <div className="input-row">
                <div className="input-group password-group">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
                  <label>Password *</label>
                  <button type="button" className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
                <div className="input-group password-group">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                  <label>Confirm Password *</label>
                  <button type="button" className="toggle-visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                  {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>
              </div>

              <label className="terms-checkbox">
                <input type="checkbox" required />
                <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></span>
              </label>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="login-text">
              Already have an account? <a href="/login">Log in here</a>
            </p>

            <div className="secure-note">
              Your data is safe and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;