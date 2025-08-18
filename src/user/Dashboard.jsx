import { useAuth } from "../state/AuthContext";
import { useEffect, useState } from "react";
import api from "../utils/api";

export default function UserDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    vehicleCount: 0,
    recentLogs: [],
    totalEntries: 0,
    loading: true,
  });

  const loadDashboardData = async () => {
    try {
      const [vehiclesRes, logsRes] = await Promise.all([
        api.get("/api/users/vehicles"),
        api.get("/api/users/logs"),
      ]);

      const vehicles = vehiclesRes.data.vehicles || [];
      const logs = logsRes.data.logs || [];

      setStats({
        vehicleCount: vehicles.length,
        recentLogs: logs.slice(0, 3),
        totalEntries: logs.length,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-container fade-in">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, {profile?.firstName || profile?.email?.split("@")[0]}!
          </h1>
          <p className="welcome-subtitle">
            Here's an overview of your vehicle activity
          </p>
        </div>
        <div className="user-avatar-large">
          <div className="avatar-circle">
            {(
              profile?.firstName?.[0] ||
              profile?.email?.[0] ||
              "U"
            ).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-number">
              {stats.loading ? "..." : stats.vehicleCount}
            </div>
            <div className="stat-label">My Vehicles</div>
            <div className="stat-description">
              {stats.vehicleCount === 1
                ? "Vehicle registered"
                : "Vehicles registered"}
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">
              {stats.loading ? "..." : stats.totalEntries}
            </div>
            <div className="stat-label">Total Entries</div>
            <div className="stat-description">All-time entry records</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <div className="stat-number">
              {stats.loading ? "..." : stats.recentLogs.length}
            </div>
            <div className="stat-label">Recent Activity</div>
            <div className="stat-description">Last 7 days</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <a href="/user/vehicles" className="action-card touch-target">
            <div className="action-icon">➕</div>
            <div className="action-content">
              <div className="action-title">Add Vehicle</div>
              <div className="action-description">Register a new vehicle</div>
            </div>
          </a>

          <a href="/user/vehicles" className="action-card touch-target">
            <div className="action-icon">🚙</div>
            <div className="action-content">
              <div className="action-title">Manage Vehicles</div>
              <div className="action-description">
                View and edit your vehicles
              </div>
            </div>
          </a>

          <a href="/user/logs" className="action-card touch-target">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <div className="action-title">View Logs</div>
              <div className="action-description">Check entry/exit history</div>
            </div>
          </a>

          <a href="/user/profile" className="action-card touch-target">
            <div className="action-icon">👤</div>
            <div className="action-content">
              <div className="action-title">Update Profile</div>
              <div className="action-description">
                Edit personal information
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-card">
          {stats.loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Loading recent activity...</span>
            </div>
          ) : stats.recentLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">No recent activity</div>
              <div className="empty-description">
                Your vehicle entry/exit logs will appear here
              </div>
            </div>
          ) : (
            <div className="activity-list">
              {stats.recentLogs.map((log, index) => (
                <div key={log._id || index} className="activity-item">
                  <div className="activity-indicator">
                    <div
                      className={`activity-dot ${
                        log.timeOut ? "completed" : "active"
                      }`}
                    ></div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <span className="activity-vehicle">
                        {log.vehicleNumber}
                      </span>
                      <span className="activity-action">
                        {log.timeOut ? "Exited" : "Entered"} Gate{" "}
                        {log.gateNumber}
                      </span>
                    </div>
                    <div className="activity-meta">
                      <span className="activity-time">
                        {formatDate(log.timeOut || log.timeIn)}
                      </span>
                      {log.timeOut && log.timeIn && (
                        <span className="activity-duration">
                          Duration:{" "}
                          {Math.round(
                            (new Date(log.timeOut) - new Date(log.timeIn)) /
                              (1000 * 60)
                          )}{" "}
                          min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
