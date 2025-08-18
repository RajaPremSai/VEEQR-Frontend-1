import { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManagerGuards() {
  const [guards, setGuards] = useState([]);
  const [filteredGuards, setFilteredGuards] = useState([]);
  const [gates, setGates] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    empNumber: "",
    email: "",
    password: "StrongPass@123",
    contactNumber: "",
    securityGuardId: "",
    assignedGates: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuards, setSelectedGuards] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res1 = await api.get("/api/manager/security-guards");
      setGuards(res1.data.guards || []);
      setFilteredGuards(res1.data.guards || []);
      const res2 = await api.get("/api/manager/gates");
      setGates(res2.data.gates || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Search functionality
  useEffect(() => {
    let filtered = guards;

    if (searchTerm) {
      filtered = filtered.filter(
        (guard) =>
          guard.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guard.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guard.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guard.empNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guard.securityGuardId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGuards(filtered);
  }, [guards, searchTerm]);

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedGuards(filteredGuards.map((g) => g._id));
    } else {
      setSelectedGuards([]);
    }
  };

  const handleSelectGuard = (guardId, checked) => {
    if (checked) {
      setSelectedGuards([...selectedGuards, guardId]);
    } else {
      setSelectedGuards(selectedGuards.filter((id) => id !== guardId));
    }
  };

  const handleBulkDelete = () => {
    setConfirmAction({
      type: "bulkDelete",
      message: `Are you sure you want to delete ${selectedGuards.length} selected security guards?`,
      action: async () => {
        try {
          await Promise.all(
            selectedGuards.map((id) =>
              api.delete(`/api/manager/security-guards/${id}`)
            )
          );
          setSelectedGuards([]);
          await load();
        } catch (error) {
          console.error("Failed to delete guards:", error);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  const ConfirmDialog = ({ show, onClose, action }) => {
    if (!show) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Confirm Action</h3>
          <p style={{ marginBottom: "24px", color: "#6b7280" }}>
            {action?.message}
          </p>
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <button className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn danger"
              onClick={() => {
                action?.action();
                onClose();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const toggleGate = (id) =>
    setForm((f) => ({
      ...f,
      assignedGates: f.assignedGates.includes(id)
        ? f.assignedGates.filter((x) => x !== id)
        : [...f.assignedGates, id],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/manager/security-guards", form);
      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        empNumber: "",
        email: "",
        password: "StrongPass@123",
        contactNumber: "",
        securityGuardId: "",
        assignedGates: [],
      });
      await load();
    } catch (error) {
      console.error("Failed to create security guard:", error);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    const guard = guards.find((g) => g._id === id);
    setConfirmAction({
      type: "delete",
      message: `Are you sure you want to delete ${guard?.firstName} ${guard?.lastName}?`,
      action: async () => {
        try {
          await api.delete(`/api/manager/security-guards/${id}`);
          await load();
        } catch (error) {
          console.error("Failed to delete security guard:", error);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  return (
    <div>
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        action={confirmAction}
      />

      {/* Create Security Guard Form */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🛡️ Create New Security Guard
        </h3>
        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              First Name
            </label>
            <input
              className="input"
              value={form.firstName || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Middle Name
            </label>
            <input
              className="input"
              value={form.middleName || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, middleName: e.target.value }))
              }
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Last Name
            </label>
            <input
              className="input"
              value={form.lastName || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Employee Number
            </label>
            <input
              className="input"
              value={form.empNumber || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, empNumber: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="input"
              value={form.email || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="input"
              value={form.password || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Contact Number
            </label>
            <input
              className="input"
              value={form.contactNumber || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactNumber: e.target.value }))
              }
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Security Guard ID
            </label>
            <input
              className="input"
              value={form.securityGuardId || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, securityGuardId: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: "500",
              }}
            >
              Assign Gates
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              {gates.map((g) => (
                <label
                  key={g._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: form.assignedGates.includes(g._id)
                      ? "#f0f9ff"
                      : "white",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.assignedGates.includes(g._id)}
                    onChange={() => toggleGate(g._id)}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>{g.gateName}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Gate {g.gateNumber}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              className="btn"
              disabled={loading}
              style={{ width: "100%", padding: "12px" }}
            >
              {loading ? "Creating..." : "Create Security Guard"}
            </button>
          </div>
        </form>
      </div>

      {/* Search Controls */}
      <div className="card">
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              className="input"
              placeholder="🔍 Search guards by name, email, employee number, or guard ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          {selectedGuards.length > 0 && (
            <button
              className="btn danger"
              onClick={handleBulkDelete}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              🗑️ Delete Selected ({selectedGuards.length})
            </button>
          )}
        </div>
      </div>

      {/* Security Guards Directory */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>🛡️ Security Guards Directory ({filteredGuards.length})</span>
          {filteredGuards.length > 0 && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={selectedGuards.length === filteredGuards.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All
            </label>
          )}
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
            Loading security guards...
          </div>
        ) : filteredGuards.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛡️</div>
            <h4>No security guards found</h4>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredGuards.map((guard) => (
              <div
                key={guard._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0, 0, 0, 0.05)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuards.includes(guard._id)}
                      onChange={(e) =>
                        handleSelectGuard(guard._id, e.target.checked)
                      }
                    />
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "600",
                      }}
                    >
                      {guard.firstName.charAt(0)}
                      {guard.lastName.charAt(0)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f3e8ff",
                      color: "#7c3aed",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Security Guard
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    {guard.firstName}{" "}
                    {guard.middleName ? guard.middleName + " " : ""}
                    {guard.lastName}
                  </h4>
                  <p
                    style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}
                  >
                    Guard ID: {guard.securityGuardId} • Employee #
                    {guard.empNumber}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span>📧</span>
                    <span style={{ color: "#6b7280" }}>{guard.email}</span>
                  </div>
                  {guard.contactNumber && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <span>📱</span>
                      <span style={{ color: "#6b7280" }}>
                        {guard.contactNumber}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span>🚪</span>
                    <span style={{ color: "#6b7280" }}>
                      {guard.assignedGates && guard.assignedGates.length > 0
                        ? guard.assignedGates
                            .map((gate) => gate.gateName)
                            .join(", ")
                        : "No gates assigned"}
                    </span>
                  </div>
                  {guard.createdAt && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <span>📅</span>
                      <span style={{ color: "#6b7280" }}>
                        Joined {new Date(guard.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn danger"
                    onClick={() => del(guard._id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      fontSize: "14px",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
