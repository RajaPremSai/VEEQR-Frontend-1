import { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManagerUniVehicles() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "Bus",
    vehicleModelName: "",
    driverName: "",
    driverMobileNumber: "",
  });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/manager/vehicles");
      setItems(data.vehicles || []);
      setFilteredItems(data.vehicles || []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = items;

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter(
        (vehicle) => vehicle.vehicleType === filterType
      );
    }

    // Search functionality
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.vehicleNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.vehicleModelName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.driverName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filterType]);

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedVehicles(filteredItems.map((v) => v._id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (vehicleId, checked) => {
    if (checked) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    } else {
      setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId));
    }
  };

  const handleBulkDelete = () => {
    setConfirmAction({
      type: "bulkDelete",
      message: `Are you sure you want to delete ${selectedVehicles.length} selected vehicles?`,
      action: async () => {
        try {
          await Promise.all(
            selectedVehicles.map((id) =>
              api.delete(`/api/manager/vehicles/${id}`)
            )
          );
          setSelectedVehicles([]);
          await load();
        } catch (error) {
          console.error("Failed to delete vehicles:", error);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  // Inline editing
  const startEdit = (vehicle) => {
    setEditingVehicle({ ...vehicle });
  };

  const cancelEdit = () => {
    setEditingVehicle(null);
  };

  const saveEdit = async () => {
    if (!editingVehicle) return;

    try {
      await api.put(`/api/manager/vehicles/${editingVehicle._id}`, {
        vehicleNumber: editingVehicle.vehicleNumber,
        vehicleType: editingVehicle.vehicleType,
        vehicleModelName: editingVehicle.vehicleModelName,
        driverName: editingVehicle.driverName,
        driverMobileNumber: editingVehicle.driverMobileNumber,
      });
      setEditingVehicle(null);
      await load();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  // Drag and drop for reordering
  const handleDragStart = (e, vehicle) => {
    setDraggedItem(vehicle);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetVehicle) => {
    e.preventDefault();
    if (!draggedItem || draggedItem._id === targetVehicle._id) return;

    const draggedIndex = filteredItems.findIndex(
      (v) => v._id === draggedItem._id
    );
    const targetIndex = filteredItems.findIndex(
      (v) => v._id === targetVehicle._id
    );

    const newItems = [...filteredItems];
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    setFilteredItems(newItems);
    setDraggedItem(null);
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
      await api.post("/api/manager/vehicles", form);
      setForm({
        vehicleNumber: "",
        vehicleType: "Bus",
        vehicleModelName: "",
        driverName: "",
        driverMobileNumber: "",
      });
      await load();
    } catch (error) {
      console.error("Failed to create vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    const vehicle = items.find((v) => v._id === id);
    setConfirmAction({
      type: "delete",
      message: `Are you sure you want to delete vehicle "${vehicle?.vehicleNumber}"?`,
      action: async () => {
        try {
          await api.delete(`/api/manager/vehicles/${id}`);
          await load();
        } catch (error) {
          console.error("Failed to delete vehicle:", error);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case "Bus":
        return "🚌";
      case "Car":
        return "🚗";
      case "Ambulance":
        return "🚑";
      case "Van":
        return "🚐";
      case "Truck":
        return "🚛";
      default:
        return "🚗";
    }
  };

  const getVehicleColor = (type) => {
    switch (type) {
      case "Bus":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "Car":
        return { bg: "#d1fae5", color: "#047857" };
      case "Ambulance":
        return { bg: "#fee2e2", color: "#dc2626" };
      case "Van":
        return { bg: "#fef3c7", color: "#d97706" };
      case "Truck":
        return { bg: "#f3e8ff", color: "#7c3aed" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div>
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        action={confirmAction}
      />

      {/* Add Vehicle Form */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🚌 Add University Vehicle
        </h3>
        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
              Vehicle Number
            </label>
            <input
              className="input"
              value={form.vehicleNumber || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleNumber: e.target.value }))
              }
              required
              placeholder="e.g., UNI-001"
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
              Vehicle Type
            </label>
            <select
              className="input"
              value={form.vehicleType || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleType: e.target.value }))
              }
              style={{ width: "100%" }}
            >
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Model Name
            </label>
            <input
              className="input"
              value={form.vehicleModelName || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleModelName: e.target.value }))
              }
              placeholder="e.g., Toyota Hiace"
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
              Driver Name
            </label>
            <input
              className="input"
              value={form.driverName || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, driverName: e.target.value }))
              }
              placeholder="Driver's full name"
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
              Driver Mobile
            </label>
            <input
              className="input"
              value={form.driverMobileNumber || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, driverMobileNumber: e.target.value }))
              }
              placeholder="Driver's phone number"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              className="btn"
              disabled={loading}
              style={{ width: "100%", padding: "12px" }}
            >
              {loading ? "Adding..." : "Add Vehicle"}
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
              placeholder="🔍 Search vehicles by number, model, driver, or type..."
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
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {selectedVehicles.length > 0 && (
            <button
              className="btn danger"
              onClick={handleBulkDelete}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              🗑️ Delete Selected ({selectedVehicles.length})
            </button>
          )}
        </div>
      </div>

      {/* University Vehicles */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>🚌 University Vehicles ({filteredItems.length})</span>
          {filteredItems.length > 0 && (
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
                checked={selectedVehicles.length === filteredItems.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All
            </label>
          )}
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
            Loading vehicles...
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚌</div>
            <h4>No vehicles found</h4>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filteredItems.map((vehicle) => {
              const colors = getVehicleColor(vehicle.vehicleType);
              return (
                <div
                  key={vehicle._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, vehicle)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, vehicle)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    background: "white",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                    cursor: draggedItem ? "grabbing" : "grab",
                    opacity:
                      draggedItem && draggedItem._id === vehicle._id ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!draggedItem) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!draggedItem) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0, 0, 0, 0.05)";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(vehicle._id)}
                        onChange={(e) =>
                          handleSelectVehicle(vehicle._id, e.target.checked)
                        }
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg, #10B981 0%, #047857 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "20px",
                          }}
                        >
                          {getVehicleIcon(vehicle.vehicleType)}
                        </div>
                        <div style={{ flex: 1 }}>
                          {editingVehicle &&
                          editingVehicle._id === vehicle._id ? (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "8px",
                                minWidth: "300px",
                              }}
                            >
                              <input
                                className="input"
                                value={editingVehicle.vehicleNumber}
                                onChange={(e) =>
                                  setEditingVehicle({
                                    ...editingVehicle,
                                    vehicleNumber: e.target.value,
                                  })
                                }
                                placeholder="Vehicle Number"
                              />
                              <select
                                className="input"
                                value={editingVehicle.vehicleType}
                                onChange={(e) =>
                                  setEditingVehicle({
                                    ...editingVehicle,
                                    vehicleType: e.target.value,
                                  })
                                }
                              >
                                <option value="Bus">Bus</option>
                                <option value="Car">Car</option>
                                <option value="Ambulance">Ambulance</option>
                                <option value="Van">Van</option>
                                <option value="Truck">Truck</option>
                                <option value="Other">Other</option>
                              </select>
                              <input
                                className="input"
                                value={editingVehicle.vehicleModelName || ""}
                                onChange={(e) =>
                                  setEditingVehicle({
                                    ...editingVehicle,
                                    vehicleModelName: e.target.value,
                                  })
                                }
                                placeholder="Model Name"
                              />
                              <input
                                className="input"
                                value={editingVehicle.driverName || ""}
                                onChange={(e) =>
                                  setEditingVehicle({
                                    ...editingVehicle,
                                    driverName: e.target.value,
                                  })
                                }
                                placeholder="Driver Name"
                              />
                            </div>
                          ) : (
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  marginBottom: "8px",
                                }}
                              >
                                <h4
                                  style={{
                                    margin: "0",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {vehicle.vehicleNumber}
                                </h4>
                                <div
                                  style={{
                                    background: colors.bg,
                                    color: colors.color,
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {vehicle.vehicleType}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  fontSize: "14px",
                                  color: "#6b7280",
                                }}
                              >
                                {vehicle.vehicleModelName && (
                                  <div>
                                    🚗 Model: {vehicle.vehicleModelName}
                                  </div>
                                )}
                                {vehicle.driverName && (
                                  <div>👨‍✈️ Driver: {vehicle.driverName}</div>
                                )}
                                {vehicle.driverMobileNumber && (
                                  <div>
                                    📱 Mobile: {vehicle.driverMobileNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        {editingVehicle &&
                        editingVehicle._id === vehicle._id ? (
                          <>
                            <button
                              className="btn secondary"
                              onClick={cancelEdit}
                              style={{ fontSize: "14px", padding: "8px 12px" }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn"
                              onClick={saveEdit}
                              style={{ fontSize: "14px", padding: "8px 12px" }}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn secondary"
                              onClick={() => startEdit(vehicle)}
                              style={{ fontSize: "14px", padding: "8px 12px" }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn danger"
                              onClick={() => del(vehicle._id)}
                              style={{ fontSize: "14px", padding: "8px 12px" }}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredItems.length > 1 && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            💡 Tip: Drag and drop vehicles to reorder them
          </div>
        )}
      </div>
    </div>
  );
}
