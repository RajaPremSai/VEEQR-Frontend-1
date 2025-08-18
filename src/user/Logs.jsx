import { useEffect, useState } from "react";
import api from "../utils/api";

export default function UserLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    vehicleNumber: "",
    dateRange: "all", // all, today, week, month
    status: "all", // all, active, completed
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/logs");
      const sortedLogs = (data.logs || []).sort(
        (a, b) =>
          new Date(b.timeIn || b.createdAt) - new Date(a.timeIn || a.createdAt)
      );
      setLogs(sortedLogs);
      setFilteredLogs(sortedLogs);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = logs;

    // Filter by vehicle number
    if (filters.vehicleNumber) {
      filtered = filtered.filter((log) =>
        log.vehicleNumber
          .toLowerCase()
          .includes(filters.vehicleNumber.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timeIn || log.createdAt);
        return logDate >= filterDate;
      });
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((log) => {
        if (filters.status === "active") return !log.timeOut;
        if (filters.status === "completed") return log.timeOut;
        return true;
      });
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return null;
    const duration = Math.round(
      (new Date(exitTime) - new Date(entryTime)) / (1000 * 60)
    );
    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStatusInfo = (log) => {
    if (log.timeOut) {
      return {
        status: "completed",
        label: "Completed",
        icon: "✅",
        color: "success",
      };
    } else {
      return {
        status: "active",
        label: "Active",
        icon: "🟢",
        color: "info",
      };
    }
  };

  const clearFilters = () => {
    setFilters({
      vehicleNumber: "",
      dateRange: "all",
      status: "all",
    });
  };

  const hasActiveFilters =
    filters.vehicleNumber ||
    filters.dateRange !== "all" ||
    filters.status !== "all";

  return (
    <div className="logs-container">
      {/* Header Section */}
      <div className="logs-header">
        <div className="header-content">
          <h1 className="page-title">Vehicle Logs</h1>
          <p className="page-subtitle">
            Track your vehicle entry and exit history
          </p>
        </div>
        <div className="logs-stats">
          <div className="stat-item">
            <span className="stat-number">{logs.length}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {logs.filter((l) => !l.timeOut).length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="logs-filters">
        <div className="filter-group">
          <label className="filter-label">Vehicle Number</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by vehicle number..."
            value={filters.vehicleNumber}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, vehicleNumber: e.target.value }))
            }
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <select
            className="filter-select"
            value={filters.dateRange}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
            }
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="all">All Status</option>
            <option value="active">🟢 Active</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            <span className="btn-icon">🗑️</span>
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Content */}
      <div className="logs-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">
              {logs.length === 0
                ? "No logs found"
                : "No logs match your filters"}
            </div>
            <div className="empty-description">
              {logs.length === 0
                ? "Your vehicle entry/exit logs will appear here once you start using the system"
                : "Try adjusting your filters to see more results"}
            </div>
            {hasActiveFilters && (
              <button className="btn secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="timeline-container">
            <div className="timeline">
              {filteredLogs.map((log, index) => {
                const entryDateTime = formatDateTime(log.timeIn);
                const exitDateTime = formatDateTime(log.timeOut);
                const duration = calculateDuration(log.timeIn, log.timeOut);
                const statusInfo = getStatusInfo(log);

                return (
                  <div key={log._id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`timeline-dot ${statusInfo.status}`}>
                        <span className="timeline-icon">{statusInfo.icon}</span>
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>

                    <div className="timeline-content">
                      <div className="log-card">
                        <div className="log-header">
                          <div className="log-vehicle">
                            <span className="vehicle-icon">🚗</span>
                            <span className="vehicle-number">
                              {log.vehicleNumber}
                            </span>
                          </div>
                          <div className={`log-status ${statusInfo.color}`}>
                            <span className="status-icon">
                              {statusInfo.icon}
                            </span>
                            <span className="status-label">
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>

                        <div className="log-details">
                          <div className="log-section">
                            <div className="section-title">Entry Details</div>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="detail-label">Gate</span>
                                <span className="detail-value">
                                  Gate {log.gateNumber}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Date</span>
                                <span className="detail-value">
                                  {entryDateTime.date}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Time</span>
                                <span className="detail-value">
                                  {entryDateTime.time}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Guard</span>
                                <span className="detail-value">
                                  {log.securityGuardName || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {log.timeOut && (
                            <div className="log-section">
                              <div className="section-title">Exit Details</div>
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">Date</span>
                                  <span className="detail-value">
                                    {exitDateTime.date}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Time</span>
                                  <span className="detail-value">
                                    {exitDateTime.time}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Duration</span>
                                  <span className="detail-value duration">
                                    {duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="log-footer">
                          <div className="log-id">
                            Log ID: {log.logId || log._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {!loading && logs.length > 0 && (
        <div className="results-summary">
          Showing {filteredLogs.length} of {logs.length} logs
          {hasActiveFilters && " (filtered)"}
        </div>
      )}
    </div>
  );
}
