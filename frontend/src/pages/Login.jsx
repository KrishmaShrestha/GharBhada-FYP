import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastr";
import GharBhadaLogo from "../components/GharBhadaLogo";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ emailOrPhone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginData, rememberMe }),
      });

      const data = await response.json();
      setLoading(false);
      
      if (response.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        const role = data.user.role;
        
        showSuccess(`Welcome ${data.user.fullName}! Login Successful!`, 'Login Success');
        
        setTimeout(() => {
          if (role === "Tenant") {
            navigate("/tenant/dashboard");
          } else if (role === "Owner") {
            navigate("/owner/dashboard");
          } else if (role === "Admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        showError(data.message || "Login failed", 'Login Failed');
      }
    } catch (error) {
      setLoading(false);
      showError("Server error. Please check your connection and try again.", 'Connection Error');
    }
  };

  return (
    <div className="login-fullscreen">
      <div className="login-container">
        {/* Left: Hero Section */}
        <div className="login-hero-side">
          <div className="hero-content">
            <div className="logo-hero" onClick={() => navigate("/")}>
              <GharBhadaLogo size={65} showText={true} className="login-logo" />
            </div>
            
            <h2>Welcome Back!</h2>
            <p>Rent smarter in Nepal. Trusted by thousands of tenants and property owners across Kathmandu, Pokhara, and beyond.</p>
            
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

        {/* Right: Login Form */}
        <div className="login-form-side">
          <div className="login-card">
            {/* Login/Signup Toggle Tabs */}
            <div className="auth-tabs">
              <button 
                type="button"
                className="auth-tab active"
              >
                Log In
              </button>
              <button 
                type="button"
                className="auth-tab"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </div>

            <div className="form-header">
              <h1>Welcome Back</h1>
              <p className="subtitle">Log in to manage your rentals</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <input 
                  type="text" 
                  name="emailOrPhone" 
                  value={loginData.emailOrPhone}
                  onChange={handleChange} 
                  required 
                  placeholder=" "
                />
                <label>Email or Phone Number</label>
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
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
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <button 
                  type="button"
                  className="forgot-password"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="signup-link">
              <p>Don't have an account?</p>
              <button 
                type="button" 
                className="signup-btn" 
                onClick={() => navigate("/signup")}
              >
                Create Account
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

export default Login;