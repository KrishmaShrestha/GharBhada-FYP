import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastr";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rememberMe }),
      });

      const data = await response.json();
      setLoading(false);
      
      if (response.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        const role = data.user.role;
        
        // Show success message first
        showSuccess(`Welcome ${data.user.fullName}! Login Successful!`, 'Login Success');
        
        // Navigate based on role with a small delay to show the toast
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
        {/* Left: Form */}
        <div className="login-form-side">
          <div className="login-card">
            <div className="logo">
              <span className="logo-text">GharBhada</span>
              <span className="tagline">Find Your Perfect Home</span>
            </div>

            <h1>Welcome Back</h1>
            <p className="subtitle">Log in to manage your rentals</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="emailOrPhone" onChange={handleChange} required />
                <label>Email or Phone Number</label>
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  required
                />
                <label>Password</label>
                <button type="button" className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="/forgot-password" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="divider"><span>or</span></div>

            <p className="signup-text">
              Don't have an account? <a href="/signup">Sign up free</a>
            </p>

            <div className="secure-note">
              Your data is safe and encrypted
            </div>
          </div>
        </div>

        {/* Right: Hero */}
        <div className="login-hero-side">
          <div className="hero-content">
            <h2>Rent Smarter in Nepal</h2>
            <p>Trusted by thousands of tenants and property owners across Kathmandu, Pokhara, and beyond.</p>
            <div className="stats">
              <div className="stat">
                <strong>10K+</strong>
                <span>Active Listings</span>
              </div>
              <div className="stat">
                <strong>50K+</strong>
                <span>Happy Users</span>
              </div>
            </div>
            <div className="contact-support">
              Need help? Call <strong>+977 9712345678</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;