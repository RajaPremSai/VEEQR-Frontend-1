import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("manager@example.edu");
  const [password, setPassword] = useState("StrongPass@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (profile.role === "MANAGER") navigate("/manager");
      else if (profile.role === "SECURITY_GUARD") navigate("/guard");
      else navigate("/user");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Pattern */}
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>

      {/* Header */}
      <div className="auth-header">
        <div className="container">
          <div className="auth-brand">
            <div className="auth-logo-icon">🔐</div>
            <div className="auth-brand-text">
              <div className="auth-brand-name">UniPass</div>
              <div className="auth-brand-tagline">
                Smart Access for Smarter Campuses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="auth-container">
        <div className="auth-content">
          {/* Welcome Section */}
          <div className="auth-welcome">
            <div className="auth-icon">
              <div className="auth-icon-circle">🚗</div>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access your campus dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <div
                className={`floating-input ${
                  emailFocused || email ? "focused" : ""
                }`}
              >
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="floating-input-field"
                />
                <label htmlFor="email" className="floating-label">
                  <span className="floating-label-icon">📧</span>
                  Email Address
                </label>
                <div className="floating-input-border"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div
                className={`floating-input ${
                  passwordFocused || password ? "focused" : ""
                }`}
              >
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="floating-input-field"
                />
                <label htmlFor="password" className="floating-label">
                  <span className="floating-label-icon">🔒</span>
                  Password
                </label>
                <div className="floating-input-border"></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error">
                <div className="auth-error-icon">⚠️</div>
                <div className="auth-error-message">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <div className="auth-loading">
                  <div className="auth-spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <div className="auth-btn-icon">→</div>
                </>
              )}
            </button>
          </form>

          {/* Quick Access Info */}
          <div className="auth-info-card">
            <div className="auth-info-header">
              <div className="auth-info-icon">⚡</div>
              <h3>Quick Access</h3>
            </div>
            <p className="auth-info-text">Use these credentials for testing:</p>
            <div className="auth-demo-credentials">
              <div className="demo-credential-label">Manager Account</div>
              <div className="demo-credential-value">
                manager@example.edu / StrongPass@123
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <span className="auth-footer-text">New user?</span>
            <Link to="/signup" className="auth-footer-link">
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="auth-bottom-footer">
        <div className="auth-features">
          <span>🔒 Secure</span>
          <span>🚀 Fast</span>
          <span>📱 Mobile-Friendly</span>
        </div>
        <p className="auth-copyright">© 2024 UniPass. All rights reserved.</p>
      </div>
    </div>
  );
}
