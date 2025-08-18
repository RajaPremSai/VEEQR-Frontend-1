import { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManagerUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    empNumber: "",
    email: "",
    password: "StrongPass@123",
    contactNumber: "",
    userType: "Employee",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/manager/users");
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = users;

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter((user) => user.userType === filterType);
    }

    // Search functionality
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.empNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterType]);

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleBulkDelete = () => {
    setConfirmAction({
      type: "bulkDelete",
      message: `Are you sure you want to delete ${selectedUsers.length} selected users?`,
      action: async () => {
        try {
          await Promise.all(
            selectedUsers.map((id) => api.delete(`/api/manager/users/${id}`))
          );
          setSelectedUsers([]);
          await load();
        } catch (error) {
          console.error("Failed to delete users:", error);
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

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/manager/users", form);
      setForm({
        firstName: "",
        lastName: "",
        empNumber: "",
        email: "",
        password: "StrongPass@123",
        contactNumber: "",
        userType: "Employee",
      });
      await load();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    const user = users.find((u) => u._id === id);
    setConfirmAction({
      type: "delete",
      message: `Are you sure you want to delete ${user?.firstName} ${user?.lastName}?`,
      action: async () => {
        try {
          await api.delete(`/api/manager/users/${id}`);
          await load();
        } catch (error) {
          console.error("Failed to delete user:", error);
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

      {/* Create User Form */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          👤 Create New User
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
              User Type
            </label>
            <select
              className="input"
              value={form.userType || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, userType: e.target.value }))
              }
              style={{ width: "100%" }}
            >
              <option value="Employee">Employee</option>
              <option value="Student">Student</option>
              <option value="Visitor">Visitor</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              className="btn"
              disabled={loading}
              style={{ width: "100%", padding: "12px" }}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Search and Filter Controls */}
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
              placeholder="🔍 Search users by name, email, or employee number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Employee">Employee</option>
              <option value="Student">Student</option>
              <option value="Visitor">Visitor</option>
            </select>
          </div>
          {selectedUsers.length > 0 && (
            <button
              className="btn danger"
              onClick={handleBulkDelete}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              🗑️ Delete Selected ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Users Directory */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>👥 Users Directory ({filteredUsers.length})</span>
          {filteredUsers.length > 0 && (
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
                checked={selectedUsers.length === filteredUsers.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All
            </label>
          )}
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
            <h4>No users found</h4>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
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
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) =>
                        handleSelectUser(user._id, e.target.checked)
                      }
                    />
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${
                          user.userType === "Employee"
                            ? "#3B82F6"
                            : user.userType === "Student"
                            ? "#10B981"
                            : "#F59E0B"
                        } 0%, ${
                          user.userType === "Employee"
                            ? "#1E40AF"
                            : user.userType === "Student"
                            ? "#047857"
                            : "#D97706"
                        } 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "600",
                      }}
                    >
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </div>
                  </div>
                  <div
                    style={{
                      background:
                        user.userType === "Employee"
                          ? "#dbeafe"
                          : user.userType === "Student"
                          ? "#d1fae5"
                          : "#fef3c7",
                      color:
                        user.userType === "Employee"
                          ? "#1e40af"
                          : user.userType === "Student"
                          ? "#047857"
                          : "#d97706",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {user.userType}
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
                    {user.firstName}{" "}
                    {user.middleName ? user.middleName + " " : ""}
                    {user.lastName}
                  </h4>
                  <p
                    style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}
                  >
                    Employee #{user.empNumber}
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
                    <span style={{ color: "#6b7280" }}>{user.email}</span>
                  </div>
                  {user.contactNumber && (
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
                        {user.contactNumber}
                      </span>
                    </div>
                  )}
                  {user.createdAt && (
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
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn danger"
                    onClick={() => del(user._id)}
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
