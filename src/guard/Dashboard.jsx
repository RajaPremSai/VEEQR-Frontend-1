import { useEffect, useState } from "react";
import api from "../utils/api";

export default function GuardDashboard() {
  const [gates, setGates] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    todayEntries: 0,
    todayExits: 0,
    activeVehicles: 0,
  });
  const [form, setForm] = useState({
    gateNumber: "",
    direction: "IN",
    vehicleNumber: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load gates
      const gatesResponse = await api.get("/api/security-guards/gates");
      const gatesData = gatesResponse.data.gates || [];
      setGates(gatesData);
      if (gatesData[0] && !form.gateNumber) {
        setForm((f) => ({ ...f, gateNumber: gatesData[0].gateNumber }));
      }

      // Load recent logs for real-time activity
      const logsResponse = await api.get("/api/security-guards/logs?limit=5");
      setRecentLogs(logsResponse.data.logs || []);

      // Calculate today's stats (mock data for demo)
      const today = new Date().toDateString();
      const todayLogs = (logsResponse.data.logs || []).filter(
        (log) => new Date(log.timeIn || log.createdAt).toDateString() === today
      );

      setStats({
        todayEntries: todayLogs.filter(
          (log) => log.direction === "IN" || log.timeIn
        ).length,
        todayExits: todayLogs.filter(
          (log) => log.direction === "OUT" || log.timeOut
        ).length,
        activeVehicles: todayLogs.filter((log) => log.timeIn && !log.timeOut)
          .length,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/security-guards/logs", form);
      setMsg(
        `Successfully logged ${form.direction} for ${data.log.vehicleNumber}`
      );
      setForm((f) => ({ ...f, vehicleNumber: "" }));

      // Refresh dashboard data after successful log
      setTimeout(loadDashboardData, 1000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to log entry");
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (action) => {
    if (action === "scanner") {
      window.location.href = "/guard/scanner";
    } else if (action === "logs") {
      window.location.href = "/guard/logs";
    } else if (action === "gates") {
      window.location.href = "/guard/gates";
    }
  };

  return (
    <div className="guard-dashboard">
      {/* Status Board */}
      <div className="status-board">
        <div className="status-header">
          <h2>Security Guard Dashboard</h2>
          <div className="last-update">
            <span className="update-indicator"></span>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card entries">
            <div className="stat-icon">📥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.todayEntries}</div>
              <div className="stat-label">Today's Entries</div>
            </div>
          </div>

          <div className="stat-card exits">
            <div className="stat-icon">📤</div>
            <div className="stat-content">
              <div className="stat-number">{stats.todayExits}</div>
              <div className="stat-label">Today's Exits</div>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">🚗</div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeVehicles}</div>
              <div className="stat-label">Vehicles Inside</div>
            </div>
          </div>

          <div className="stat-card gates">
            <div className="stat-icon">🚪</div>
            <div className="stat-content">
              <div className="stat-number">{gates.length}</div>
              <div className="stat-label">Assigned Gates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="quick-actions-panel">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button
            className="action-btn scanner-btn"
            onClick={() => quickAction("scanner")}
          >
            <div className="action-icon">📱</div>
            <div className="action-label">QR Scanner</div>
            <div className="action-desc">Scan vehicle QR codes</div>
          </button>

          <button
            className="action-btn logs-btn"
            onClick={() => quickAction("logs")}
          >
            <div className="action-icon">📋</div>
            <div className="action-label">View Logs</div>
            <div className="action-desc">Check entry/exit logs</div>
          </button>

          <button
            className="action-btn gates-btn"
            onClick={() => quickAction("gates")}
          >
            <div className="action-icon">🚪</div>
            <div className="action-label">My Gates</div>
            <div className="action-desc">Manage assigned gates</div>
          </button>
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="manual-entry-card">
        <h3>Manual Vehicle Entry</h3>
        <form onSubmit={submit} className="manual-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label>Select Gate</label>
              <select
                className="input"
                value={form.gateNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gateNumber: e.target.value }))
                }
                required
              >
                <option value="">Choose Gate</option>
                {gates.map((g) => (
                  <option key={g._id} value={g.gateNumber}>
                    {g.gateName} ({g.gateNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Direction</label>
              <select
                className="input direction-select"
                value={form.direction}
                onChange={(e) =>
                  setForm((f) => ({ ...f, direction: e.target.value }))
                }
              >
                <option value="IN">Entry (IN)</option>
                <option value="OUT">Exit (OUT)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Vehicle Number</label>
            <input
              className="input vehicle-input"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  vehicleNumber: e.target.value.toUpperCase(),
                }))
              }
              placeholder="Enter vehicle number (e.g., KA01AB1234)"
              required
            />
          </div>

          <button
            className="btn submit-btn"
            type="submit"
            disabled={loading || !form.gateNumber || !form.vehicleNumber}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <span className="submit-icon">✓</span>
                Log {form.direction === "IN" ? "Entry" : "Exit"}
              </>
            )}
          </button>

          {msg && (
            <div
              className={`message ${
                msg.includes("Successfully") ? "success" : "error"
              }`}
            >
              {msg}
            </div>
          )}
        </form>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-card">
        <h3>Recent Activity</h3>
        {recentLogs.length === 0 ? (
          <div className="no-activity">
            <div className="no-activity-icon">📝</div>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log._id} className="activity-item">
                <div
                  className={`activity-indicator ${
                    log.direction || (log.timeOut ? "OUT" : "IN")
                  }`}
                >
                  {log.direction === "OUT" || log.timeOut ? "📤" : "📥"}
                </div>
                <div className="activity-content">
                  <div className="activity-vehicle">{log.vehicleNumber}</div>
                  <div className="activity-details">
                    Gate {log.gateNumber} •{" "}
                    {log.direction || (log.timeOut ? "EXIT" : "ENTRY")} •
                    {new Date(
                      log.timeIn || log.timeOut || log.createdAt
                    ).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
