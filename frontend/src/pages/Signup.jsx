import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastr";
import GharBhadaLogo from "../components/GharBhadaLogo";

const Signup = () => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState({
    fullName: "", email: "", phone: "", address: "", dob: "",
    citizenshipNumber: "", idFile: null, role: "", password: "", confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    if (e.target.name === "idFile") {
      setSignupData({ ...signupData, idFile: e.target.files[0] });
    } else {
      setSignupData({ ...signupData, [e.target.name]: e.target.value });
    }
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(98|97)\d{8}$/;

    if (!signupData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!signupData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(signupData.email)) newErrors.email = "Invalid email format";
    if (!signupData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(signupData.phone.replace(/[^0-9]/g, ''))) newErrors.phone = "Must be a valid Nepali number (98/97...)";
    if (!signupData.password) newErrors.password = "Password is required";
    else if (signupData.password.length < 6) newErrors.password = "Password must be 6+ characters";
    if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!signupData.role) newErrors.role = "Please select your role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const form = new FormData();
      for (let key in signupData) {
        if (signupData[key] !== null && signupData[key] !== '') {
          form.append(key, signupData[key]);
        }
      }
      
      const response = await fetch("http://localhost:5005/api/auth/signup", { 
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
        {/* Left: Hero Section */}
        <div className="signup-hero-side">
          <div className="hero-content">
            <div className="logo-hero" onClick={() => navigate("/")}>
              <GharBhadaLogo size={65} showText={true} className="signup-logo" />
            </div>
            
            <h2>Join GharBhada Today!</h2>
            <p>Create your account and start renting or listing properties with full trust and security in Nepal.</p>
            
            <div className="stats">
              <div className="stat">
                <strong>10K+</strong>
                <span>Active Listings</span>
              </div>
              <div className="stat">
                <strong>50K+</strong>
                <span>Happy Users</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
            
            <div className="contact-support">
              Need help? Call <strong>+977 9712345678</strong>
            </div>
          </div>
        </div>

        {/* Right: Signup Form */}
        <div className="signup-form-side">
          <div className="signup-card">
            {/* Login/Signup Toggle Tabs */}
            <div className="auth-tabs">
              <button 
                type="button"
                className="auth-tab"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
              <button 
                type="button"
                className="auth-tab active"
              >
                Sign Up
              </button>
            </div>

            <div className="form-header">
              <h1>Create Account</h1>
              <p className="subtitle">Join thousands of users in Nepal</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {/* Full Name */}
              <div className="input-group">
                <input 
                  type="text" 
                  name="fullName" 
                  value={signupData.fullName} 
                  onChange={handleChange} 
                  required 
                  placeholder=" "
                />
                <label>Full Name</label>
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </div>

              {/* Email Address */}
              <div className="input-group">
                <input 
                  type="email" 
                  name="email" 
                  value={signupData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder=" "
                />
                <label>Email Address</label>
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              {/* Phone Number */}
              <div className="input-group">
                <input 
                  type="text" 
                  name="phone" 
                  value={signupData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder=" "
                />
                <label>Phone Number (98/97...)</label>
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              {/* Who are you? */}
              <div className="input-group">
                <select 
                  name="role" 
                  value={signupData.role} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">-- Select Role --</option>
                  <option value="Tenant">Tenant (Looking to rent)</option>
                  <option value="Owner">Owner (Have property to rent)</option>
                </select>
                <label>Who are you?</label>
                {errors.role && <span className="error">{errors.role}</span>}
              </div>

              {/* Address */}
              <div className="input-group">
                <input 
                  type="text" 
                  name="address" 
                  value={signupData.address} 
                  onChange={handleChange} 
                  placeholder=" "
                />
                <label>Permanent Address</label>
              </div>

              {/* Date of Birth */}
              <div className="input-group">
                <input 
                  type="date" 
                  name="dob" 
                  value={signupData.dob} 
                  onChange={handleChange} 
                  placeholder=" "
                />
                <label>Date of Birth</label>
              </div>

              {/* Citizenship Number */}
              <div className="input-group">
                <input 
                  type="text" 
                  name="citizenshipNumber" 
                  value={signupData.citizenshipNumber} 
                  onChange={handleChange} 
                  placeholder=" "
                />
                <label>Citizenship Number</label>
              </div>

              {/* File Upload */}
              <div className="input-group file-group">
                <input 
                  type="file" 
                  name="idFile" 
                  accept="image/*,.pdf" 
                  onChange={handleChange} 
                  required 
                  id="idFile"
                />
                <label htmlFor="idFile" className="file-label">
                  {signupData.idFile ? signupData.idFile.name : "Upload ID Proof (Citizenship/Passport)"}
                </label>
                <p className="file-hint">JPG, PNG, PDF • Max 5MB</p>
              </div>

              {/* Password */}
              <div className="input-group password-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={signupData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder=" "
                />
                <label>Password</label>
                <button 
                  type="button" 
                  className="toggle-visibility" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="input-group password-group">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={signupData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  placeholder=" "
                />
                <label>Confirm Password</label>
                <button 
                  type="button" 
                  className="toggle-visibility" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>

              {/* Terms Checkbox */}
              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="login-link">
              <p>Already have an account?</p>
              <button 
                type="button" 
                className="login-btn-link" 
                onClick={() => navigate("/login")}
              >
                Log In Here
              </button>
            </div>

            <div className="secure-note">
              🔒 Your data is safe and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;