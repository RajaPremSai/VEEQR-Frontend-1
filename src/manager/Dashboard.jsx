import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManagerDashboard() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalGates: 0,
    todayLogs: 0,
    activeVehicles: 0,
    weeklyTrend: [],
    vehicleTypeDistribution: [],
    gateActivity: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const [usersRes, vehiclesRes, personalVehiclesRes, gatesRes, logsRes] =
        await Promise.all([
          api.get("/api/manager/users"),
          api.get("/api/manager/vehicles"),
          api.get("/api/manager/personal-vehicles"),
          api.get("/api/manager/gates"),
          api.get("/api/manager/logs"),
        ]);

      const users = usersRes.data.users || [];
      const universityVehicles = vehiclesRes.data.vehicles || [];
      const personalVehicles = personalVehiclesRes.data.vehicles || [];
      const gates = gatesRes.data.gates || [];
      const logs = logsRes.data.logs || [];

      // Calculate today's logs
      const today = new Date().toDateString();
      const todayLogs = logs.filter(
        (log) => log.timeIn && new Date(log.timeIn).toDateString() === today
      ).length;

      // Calculate weekly trend (last 7 days)
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayLogs = logs.filter(
          (log) =>
            log.timeIn &&
            new Date(log.timeIn).toDateString() === date.toDateString()
        ).length;
        weeklyTrend.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          count: dayLogs,
        });
      }

      // Vehicle type distribution
      const allVehicles = [...universityVehicles, ...personalVehicles];
      const typeCount = {};
      allVehicles.forEach((vehicle) => {
        const type = vehicle.vehicleType || "Other";
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      const vehicleTypeDistribution = Object.entries(typeCount).map(
        ([type, count]) => ({
          type,
          count,
          percentage: Math.round((count / allVehicles.length) * 100),
        })
      );

      // Gate activity
      const gateActivity = gates.map((gate) => {
        const gateLogsCount = logs.filter(
          (log) => log.gateNumber === gate.gateNumber
        ).length;
        return {
          gateName: gate.gateName,
          gateNumber: gate.gateNumber,
          activity: gateLogsCount,
        };
      });

      // Recent activity (last 10 logs)
      const recentActivity = logs
        .sort(
          (a, b) =>
            new Date(b.timeIn || b.createdAt) -
            new Date(a.timeIn || a.createdAt)
        )
        .slice(0, 10);

      setAnalytics({
        totalUsers: users.length,
        totalVehicles: allVehicles.length,
        totalGates: gates.length,
        todayLogs,
        activeVehicles: logs.filter((log) => log.timeIn && !log.timeOut).length,
        weeklyTrend,
        vehicleTypeDistribution,
        gateActivity,
        recentActivity,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);
  const quickActions = [
    {
      path: "/manager/users",
      label: "Manage Users",
      icon: "👥",
      color: "var(--primary)",
    },
    {
      path: "/manager/vehicles",
      label: "University Vehicles",
      icon: "🚌",
      color: "var(--accent)",
    },
    {
      path: "/manager/personal-vehicles",
      label: "Personal Vehicles",
      icon: "🚗",
      color: "var(--secondary)",
    },
    {
      path: "/manager/gates",
      label: "Manage Gates",
      icon: "🚪",
      color: "var(--warning)",
    },
    {
      path: "/manager/announcements",
      label: "Announcements",
      icon: "📢",
      color: "var(--error)",
    },
    {
      path: "/manager/guards",
      label: "Security Guards",
      icon: "🛡️",
      color: "var(--primary)",
    },
    {
      path: "/manager/logs",
      label: "View Logs",
      icon: "📋",
      color: "var(--accent)",
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div
        className="card"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, #1a365d 100%)",
          color: "var(--white)",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          }}
        >
          👨‍💼
        </div>
        <h1 style={{ color: "var(--white)", marginBottom: "12px" }}>
          Manager Dashboard
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "0" }}>
          Welcome to UniPass Management Console
        </p>
        <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "8px" }}>
          Manage users, vehicles, gates, and monitor campus access
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: "24px", textAlign: "center" }}>
          Quick Actions
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "24px",
                background: "var(--white)",
                border: "2px solid #E2E8F0",
                borderRadius: "12px",
                textDecoration: "none",
                color: "var(--neutral-dark)",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                e.target.style.borderColor = action.color;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                e.target.style.borderColor = "#E2E8F0";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: action.color,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "var(--white)",
                }}
              >
                {action.icon}
              </div>
              <div>
                <h4
                  style={{
                    margin: "0 0 4px 0",
                    color: "var(--primary)",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {action.label}
                </h4>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "var(--secondary)",
                    opacity: 0.8,
                  }}
                >
                  Click to access
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="card">
        <h3 style={{ marginBottom: "24px", textAlign: "center" }}>
          Key Performance Indicators
        </h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading analytics...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
              <h4 style={{ margin: "0 0 8px 0", color: "white", opacity: 0.9 }}>
                Total Users
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {analytics.totalUsers}
              </p>
              <p
                style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}
              >
                Registered in system
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚗</div>
              <h4 style={{ margin: "0 0 8px 0", color: "white", opacity: 0.9 }}>
                Total Vehicles
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {analytics.totalVehicles}
              </p>
              <p
                style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}
              >
                University + Personal
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚪</div>
              <h4 style={{ margin: "0 0 8px 0", color: "white", opacity: 0.9 }}>
                Active Gates
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {analytics.totalGates}
              </p>
              <p
                style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}
              >
                Monitoring access
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
              <h4 style={{ margin: "0 0 8px 0", color: "white", opacity: 0.9 }}>
                Today's Entries
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {analytics.todayLogs}
              </p>
              <p
                style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}
              >
                Vehicle movements
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔄</div>
              <h4 style={{ margin: "0 0 8px 0", color: "white", opacity: 0.9 }}>
                Currently Inside
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {analytics.activeVehicles}
              </p>
              <p
                style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}
              >
                Vehicles on campus
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      {!loading && (
        <>
          {/* Weekly Trend Chart */}
          <div className="card">
            <h3 style={{ marginBottom: "24px" }}>Weekly Activity Trend</h3>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                height: "200px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "8px",
                gap: "8px",
              }}
            >
              {analytics.weeklyTrend.map((day, index) => {
                const maxCount = Math.max(
                  ...analytics.weeklyTrend.map((d) => d.count)
                );
                const height = maxCount > 0 ? (day.count / maxCount) * 150 : 0;
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "40px",
                        height: `${height}px`,
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                        borderRadius: "4px 4px 0 0",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "end",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600",
                        paddingBottom: "4px",
                      }}
                    >
                      {day.count > 0 && day.count}
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "500" }}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle Type Distribution and Gate Activity */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div className="card">
              <h3 style={{ marginBottom: "24px" }}>
                Vehicle Type Distribution
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {analytics.vehicleTypeDistribution.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: `hsl(${index * 60}, 70%, 50%)`,
                      }}
                    ></div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>{item.type}</span>
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#e5e7eb",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${item.percentage}%`,
                            height: "100%",
                            background: `hsl(${index * 60}, 70%, 50%)`,
                            borderRadius: "3px",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gate Activity */}
            <div className="card">
              <h3 style={{ marginBottom: "24px" }}>Gate Activity</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {analytics.gateActivity.map((gate, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#1f2937" }}>
                        {gate.gateName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Gate {gate.gateNumber}
                      </div>
                    </div>
                    <div
                      style={{
                        background: gate.activity > 0 ? "#10b981" : "#6b7280",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {gate.activity} logs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 style={{ marginBottom: "24px" }}>Recent Activity</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {analytics.recentActivity.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  No recent activity
                </div>
              ) : (
                analytics.recentActivity.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: log.timeOut ? "#10b981" : "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "18px",
                        }}
                      >
                        {log.timeOut ? "🚗" : "🔄"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#1f2937" }}>
                          {log.vehicleNumber} - {log.vehicleOwner || "Unknown"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Gate {log.gateNumber} •{" "}
                          {log.timeOut ? "Exited" : "Entered"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {log.timeIn
                        ? new Date(log.timeIn).toLocaleString()
                        : "N/A"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Export Reports Section */}
          <div className="card">
            <h3 style={{ marginBottom: "24px" }}>Export Reports</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <button
                className="btn"
                onClick={() => window.open("/manager/logs", "_blank")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                📊 Detailed Logs Report
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  const csvContent = analytics.recentActivity
                    .map(
                      (log) =>
                        `${log.vehicleNumber},${log.vehicleOwner || ""},${
                          log.gateNumber
                        },${log.timeIn || ""}`
                    )
                    .join("\n");
                  const blob = new Blob(
                    [`Vehicle Number,Owner,Gate,Time\n${csvContent}`],
                    { type: "text/csv" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "dashboard-summary.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                📄 Export Summary CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
