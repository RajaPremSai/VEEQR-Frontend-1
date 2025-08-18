import { useEffect, useState } from "react";
import api from "../utils/api";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/profile");
      setProfile(data.profile);
      setEditForm(data.profile);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!editForm.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!editForm.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (
      editForm.contactNumber &&
      !/^\d{10}$/.test(editForm.contactNumber.replace(/\D/g, ""))
    ) {
      newErrors.contactNumber = "Please enter a valid 10-digit contact number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put("/api/users/profile", {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        middleName: editForm.middleName,
        contactNumber: editForm.contactNumber,
      });
      setProfile(data.profile);
      setEditMode(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setEditMode(false);
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <div className="empty-title">Profile not found</div>
          <div className="empty-description">
            Unable to load your profile information
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {getInitials(profile.firstName, profile.lastName)}
          </div>
          <div className="profile-basic-info">
            <h1 className="profile-name">
              {profile.firstName}{" "}
              {profile.middleName ? profile.middleName + " " : ""}
              {profile.lastName}
            </h1>
            <div className="profile-role">
              <span className="role-badge">{profile.role}</span>
              <span className="user-type">{profile.userType}</span>
            </div>
            <div className="profile-email">{profile.email}</div>
          </div>
        </div>

        <div className="profile-actions">
          {!editMode ? (
            <button className="btn primary" onClick={() => setEditMode(true)}>
              <span className="btn-icon">✏️</span>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button
                className="btn secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">💾</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <span className="tab-icon">👤</span>
          Personal Information
        </button>
        <button
          className={`tab-button ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          <span className="tab-icon">⚙️</span>
          Account Details
        </button>
        <button
          className={`tab-button ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <span className="tab-icon">📊</span>
          Activity Summary
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        {activeTab === "personal" && (
          <div className="tab-content">
            <div className="info-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">First Name</label>
                  {editMode ? (
                    <div className="edit-field">
                      <input
                        type="text"
                        className={`form-input ${
                          errors.firstName ? "error" : ""
                        }`}
                        value={editForm.firstName || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter first name"
                      />
                      {errors.firstName && (
                        <span className="field-error">{errors.firstName}</span>
                      )}
                    </div>
                  ) : (
                    <div className="info-value">{profile.firstName}</div>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Middle Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.middleName || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          middleName: e.target.value,
                        }))
                      }
                      placeholder="Enter middle name (optional)"
                    />
                  ) : (
                    <div className="info-value">
                      {profile.middleName || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Last Name</label>
                  {editMode ? (
                    <div className="edit-field">
                      <input
                        type="text"
                        className={`form-input ${
                          errors.lastName ? "error" : ""
                        }`}
                        value={editForm.lastName || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <span className="field-error">{errors.lastName}</span>
                      )}
                    </div>
                  ) : (
                    <div className="info-value">{profile.lastName}</div>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Contact Number</label>
                  {editMode ? (
                    <div className="edit-field">
                      <input
                        type="tel"
                        className={`form-input ${
                          errors.contactNumber ? "error" : ""
                        }`}
                        value={editForm.contactNumber || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            contactNumber: e.target.value,
                          }))
                        }
                        placeholder="Enter 10-digit contact number"
                      />
                      {errors.contactNumber && (
                        <span className="field-error">
                          {errors.contactNumber}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="info-value">
                      {profile.contactNumber || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="tab-content">
            <div className="info-section">
              <h3 className="section-title">Account Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Employee Number</label>
                  <div className="info-value">{profile.empNumber}</div>
                </div>

                <div className="info-item">
                  <label className="info-label">Email Address</label>
                  <div className="info-value">{profile.email}</div>
                </div>

                <div className="info-item">
                  <label className="info-label">User Type</label>
                  <div className="info-value">
                    <span className="type-badge">{profile.userType}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">Role</label>
                  <div className="info-value">
                    <span className="role-badge">{profile.role}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">Member Since</label>
                  <div className="info-value">
                    {formatDate(profile.createdAt)}
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">Last Updated</label>
                  <div className="info-value">
                    {formatDate(profile.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="tab-content">
            <div className="info-section">
              <h3 className="section-title">Activity Summary</h3>
              <div className="activity-stats">
                <div className="activity-card">
                  <div className="activity-icon">🚗</div>
                  <div className="activity-content">
                    <div className="activity-number">-</div>
                    <div className="activity-label">Vehicles Registered</div>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="activity-icon">📊</div>
                  <div className="activity-content">
                    <div className="activity-number">-</div>
                    <div className="activity-label">Total Entries</div>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="activity-icon">🕒</div>
                  <div className="activity-content">
                    <div className="activity-number">-</div>
                    <div className="activity-label">This Month</div>
                  </div>
                </div>
              </div>

              <div className="activity-note">
                <p>
                  Detailed activity statistics will be available once you start
                  using the vehicle tracking system.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
