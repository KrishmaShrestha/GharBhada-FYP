import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, rememberMe }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          const role = data.user.role?.toLowerCase();
          
          // Show success message first
          alert(`Welcome ${data.user.fullName}! Login Successful!`);
          
          // Navigate based on role
          if (role === "tenant") {
            navigate("/tenant/dashboard");
          } else if (role === "owner") {
            navigate("/owner/dashboard");
          } else if (role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          alert(data.message || "Login failed");
        }
      })
      .catch(() => {
        setLoading(false);
        alert("Server error");
      });
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