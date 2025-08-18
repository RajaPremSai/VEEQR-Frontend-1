import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    empNumber: "",
    email: "",
    password: "",
    contactNumber: "",
    userType: "Employee",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedFields, setFocusedFields] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password confirmation
    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      setPasswordMatch(false);
      return;
    }

    // Check password strength
    if (passwordStrength.score < 2) {
      setError("Please choose a stronger password");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/users/register", form);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value }));

    // Handle password strength checking
    if (k === "password") {
      checkPasswordStrength(value);
      if (confirmPassword) {
        setPasswordMatch(value === confirmPassword);
      }
    }
  };

  const handleFocus = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: false }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMatch(form.password === value);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("Lowercase letter");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Uppercase letter");

    if (/\d/.test(password)) score++;
    else feedback.push("Number");

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push("Special character");

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score === 0) return "Very Weak";
    if (passwordStrength.score === 1) return "Weak";
    if (passwordStrength.score === 2) return "Fair";
    if (passwordStrength.score === 3) return "Good";
    if (passwordStrength.score === 4) return "Strong";
    return "Very Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return "var(--error-500)";
    if (passwordStrength.score === 2) return "var(--warning-500)";
    if (passwordStrength.score === 3) return "var(--info-500)";
    return "var(--success-500)";
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
        <div className="auth-content signup-content">
          {/* Welcome Section */}
          <div className="auth-welcome">
            <div className="auth-icon">
              <div className="auth-icon-circle">✨</div>
            </div>
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">
              Join UniPass for seamless campus access
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={onSubmit} className="auth-form signup-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.firstName || form.firstName ? "focused" : ""
                    }`}
                  >
                    <input
                      id="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={set("firstName")}
                      onFocus={() => handleFocus("firstName")}
                      onBlur={() => handleBlur("firstName")}
                      required
                      className="floating-input-field"
                    />
                    <label htmlFor="firstName" className="floating-label">
                      <span className="floating-label-icon">👤</span>
                      First Name *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.middleName || form.middleName
                        ? "focused"
                        : ""
                    }`}
                  >
                    <input
                      id="middleName"
                      type="text"
                      value={form.middleName}
                      onChange={set("middleName")}
                      onFocus={() => handleFocus("middleName")}
                      onBlur={() => handleBlur("middleName")}
                      className="floating-input-field"
                    />
                    <label htmlFor="middleName" className="floating-label">
                      <span className="floating-label-icon">👤</span>
                      Middle Name
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.lastName || form.lastName ? "focused" : ""
                    }`}
                  >
                    <input
                      id="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={set("lastName")}
                      onFocus={() => handleFocus("lastName")}
                      onBlur={() => handleBlur("lastName")}
                      required
                      className="floating-input-field"
                    />
                    <label htmlFor="lastName" className="floating-label">
                      <span className="floating-label-icon">👤</span>
                      Last Name *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.empNumber || form.empNumber ? "focused" : ""
                    }`}
                  >
                    <input
                      id="empNumber"
                      type="text"
                      value={form.empNumber}
                      onChange={set("empNumber")}
                      onFocus={() => handleFocus("empNumber")}
                      onBlur={() => handleBlur("empNumber")}
                      required
                      className="floating-input-field"
                    />
                    <label htmlFor="empNumber" className="floating-label">
                      <span className="floating-label-icon">🆔</span>
                      Employee Number *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="form-section">
              <h3 className="form-section-title">Contact Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.email || form.email ? "focused" : ""
                    }`}
                  >
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      onFocus={() => handleFocus("email")}
                      onBlur={() => handleBlur("email")}
                      required
                      className="floating-input-field"
                    />
                    <label htmlFor="email" className="floating-label">
                      <span className="floating-label-icon">📧</span>
                      Email Address *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.contactNumber || form.contactNumber
                        ? "focused"
                        : ""
                    }`}
                  >
                    <input
                      id="contactNumber"
                      type="tel"
                      value={form.contactNumber}
                      onChange={set("contactNumber")}
                      onFocus={() => handleFocus("contactNumber")}
                      onBlur={() => handleBlur("contactNumber")}
                      className="floating-input-field"
                    />
                    <label htmlFor="contactNumber" className="floating-label">
                      <span className="floating-label-icon">📱</span>
                      Contact Number
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div
                    className={`floating-input select-input ${
                      focusedFields.userType || form.userType ? "focused" : ""
                    }`}
                  >
                    <select
                      id="userType"
                      value={form.userType}
                      onChange={set("userType")}
                      onFocus={() => handleFocus("userType")}
                      onBlur={() => handleBlur("userType")}
                      required
                      className="floating-input-field"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Student">Student</option>
                      <option value="Visitor">Visitor</option>
                    </select>
                    <label htmlFor="userType" className="floating-label">
                      <span className="floating-label-icon">👥</span>
                      User Type *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <h3 className="form-section-title">Security</h3>

              <div className="form-row">
                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.password || form.password ? "focused" : ""
                    }`}
                  >
                    <input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={set("password")}
                      onFocus={() => handleFocus("password")}
                      onBlur={() => handleBlur("password")}
                      required
                      className="floating-input-field"
                    />
                    <label htmlFor="password" className="floating-label">
                      <span className="floating-label-icon">🔒</span>
                      Password *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>

                  {/* Password Strength Indicator */}
                  {form.password && (
                    <div className="password-strength">
                      <div className="password-strength-header">
                        <span className="password-strength-label">
                          Password Strength:
                        </span>
                        <span
                          className="password-strength-text"
                          style={{ color: getPasswordStrengthColor() }}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="password-strength-bar">
                        <div
                          className="password-strength-fill"
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(),
                          }}
                        ></div>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="password-feedback">
                          <span className="password-feedback-label">
                            Missing:
                          </span>
                          <ul className="password-feedback-list">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div
                    className={`floating-input ${
                      focusedFields.confirmPassword || confirmPassword
                        ? "focused"
                        : ""
                    } ${!passwordMatch ? "error" : ""}`}
                  >
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onFocus={() => handleFocus("confirmPassword")}
                      onBlur={() => handleBlur("confirmPassword")}
                      required
                      className="floating-input-field"
                    />
                    <label htmlFor="confirmPassword" className="floating-label">
                      <span className="floating-label-icon">🔒</span>
                      Confirm Password *
                    </label>
                    <div className="floating-input-border"></div>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div
                      className={`password-match ${
                        passwordMatch ? "match" : "no-match"
                      }`}
                    >
                      <span className="password-match-icon">
                        {passwordMatch ? "✅" : "❌"}
                      </span>
                      <span className="password-match-text">
                        {passwordMatch
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error">
                <div className="auth-error-icon">⚠️</div>
                <div className="auth-error-message">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="auth-success">
                <div className="auth-success-icon">✅</div>
                <div className="auth-success-message">{success}</div>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <div className="auth-btn-icon">→</div>
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="auth-footer">
            <span className="auth-footer-text">Already have an account?</span>
            <Link to="/login" className="auth-footer-link">
              Sign In
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
