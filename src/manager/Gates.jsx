import { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManagerGates() {
  const [gates, setGates] = useState([]);
  const [filteredGates, setFilteredGates] = useState([]);
  const [form, setForm] = useState({ gateNumber: "", gateName: "" });
  const [editingGate, setEditingGate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGates, setSelectedGates] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/manager/gates");
      setGates(data.gates || []);
      setFilteredGates(data.gates || []);
    } catch (error) {
      console.error("Failed to load gates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Search functionality
  useEffect(() => {
    let filtered = gates;

    if (searchTerm) {
      filtered = filtered.filter(
        (gate) =>
          gate.gateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gate.gateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGates(filtered);
  }, [gates, searchTerm]);

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedGates(filteredGates.map((g) => g._id));
    } else {
      setSelectedGates([]);
    }
  };

  const handleSelectGate = (gateId, checked) => {
    if (checked) {
      setSelectedGates([...selectedGates, gateId]);
    } else {
      setSelectedGates(selectedGates.filter((id) => id !== gateId));
    }
  };

  const handleBulkDelete = () => {
    setConfirmAction({
      type: "bulkDelete",
      message: `Are you sure you want to delete ${selectedGates.length} selected gates?`,
      action: async () => {
        try {
          await Promise.all(
            selectedGates.map((id) => api.delete(`/api/manager/gates/${id}`))
          );
          setSelectedGates([]);
          await load();
        } catch (error) {
          console.error("Failed to delete gates:", error);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  // Inline editing
  const startEdit = (gate) => {
    setEditingGate({ ...gate });
  };

  const cancelEdit = () => {
    setEditingGate(null);
  };

  const saveEdit = async () => {
    if (!editingGate) return;

    try {
      await api.put(`/api/manager/gates/${editingGate._id}`, {
        gateNumber: editingGate.gateNumber,
        gateName: editingGate.gateName,
      });
      setEditingGate(null);
      await load();
    } catch (error) {
      console.error("Failed to update gate:", error);
    }
  };

  // Drag and drop for reordering
  const handleDragStart = (e, gate) => {
    setDraggedItem(gate);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetGate) => {
    e.preventDefault();
    if (!draggedItem || draggedItem._id === targetGate._id) return;

    const draggedIndex = filteredGates.findIndex(
      (g) => g._id === draggedItem._id
    );
    const targetIndex = filteredGates.findIndex(
      (g) => g._id === targetGate._id
    );

    const newGates = [...filteredGates];
    newGates.splice(draggedIndex, 1);
    newGates.splice(targetIndex, 0, draggedItem);

    setFilteredGates(newGates);
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
      await api.post("/api/manager/gates", form);
      setForm({ gateNumber: "", gateName: "" });
      await load();
    } catch (error) {
      console.error("Failed to create gate:", error);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    const gate = gates.find((g) => g._id === id);
    setConfirmAction({
      type: "delete",
      message: `Are you sure you want to delete gate "${gate?.gateName}" (${gate?.gateNumber})?`,
      action: async () => {
        try {
          await api.delete(`/api/manager/gates/${id}`);
          await load();
        } catch (error) {
          console.error("Failed to delete gate:", error);
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

      {/* Add Gate Form */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🚪 Add New Gate
        </h3>
        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "16px",
            alignItems: "end",
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
              Gate Number
            </label>
            <input
              className="input"
              value={form.gateNumber || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, gateNumber: e.target.value }))
              }
              required
              placeholder="e.g., G001"
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
              Gate Name
            </label>
            <input
              className="input"
              value={form.gateName || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, gateName: e.target.value }))
              }
              required
              placeholder="e.g., Main Entrance"
              style={{ width: "100%" }}
            />
          </div>
          <button
            className="btn"
            disabled={loading}
            style={{ padding: "12px 24px" }}
          >
            {loading ? "Saving..." : "Add Gate"}
          </button>
        </form>
      </div>

      {/* Search and Bulk Actions */}
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
              placeholder="🔍 Search gates by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          {selectedGates.length > 0 && (
            <button
              className="btn danger"
              onClick={handleBulkDelete}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              🗑️ Delete Selected ({selectedGates.length})
            </button>
          )}
        </div>
      </div>

      {/* Gates Management */}
      <div className="card">
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>🚪 Gates Management ({filteredGates.length})</span>
          {filteredGates.length > 0 && (
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
                checked={selectedGates.length === filteredGates.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All
            </label>
          )}
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
            Loading gates...
          </div>
        ) : filteredGates.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚪</div>
            <h4>No gates found</h4>
            <p>Try adjusting your search criteria or add a new gate</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filteredGates.map((gate, index) => (
              <div
                key={gate._id}
                draggable
                onDragStart={(e) => handleDragStart(e, gate)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, gate)}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  cursor: draggedItem ? "grabbing" : "grab",
                  opacity:
                    draggedItem && draggedItem._id === gate._id ? 0.5 : 1,
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
                      checked={selectedGates.includes(gate._id)}
                      onChange={(e) =>
                        handleSelectGate(gate._id, e.target.checked)
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
                            "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "20px",
                          fontWeight: "600",
                        }}
                      >
                        🚪
                      </div>
                      <div>
                        {editingGate && editingGate._id === gate._id ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <input
                              className="input"
                              value={editingGate.gateNumber}
                              onChange={(e) =>
                                setEditingGate({
                                  ...editingGate,
                                  gateNumber: e.target.value,
                                })
                              }
                              placeholder="Gate Number"
                              style={{ width: "150px" }}
                            />
                            <input
                              className="input"
                              value={editingGate.gateName}
                              onChange={(e) =>
                                setEditingGate({
                                  ...editingGate,
                                  gateName: e.target.value,
                                })
                              }
                              placeholder="Gate Name"
                              style={{ width: "200px" }}
                            />
                          </div>
                        ) : (
                          <div>
                            <h4
                              style={{
                                margin: "0 0 4px 0",
                                fontSize: "18px",
                                fontWeight: "600",
                              }}
                            >
                              {gate.gateName}
                            </h4>
                            <p
                              style={{
                                margin: "0",
                                color: "#6b7280",
                                fontSize: "14px",
                              }}
                            >
                              Gate #{gate.gateNumber}
                            </p>
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
                    {gate.createdAt && (
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        <div>Created</div>
                        <div>
                          {new Date(gate.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      {editingGate && editingGate._id === gate._id ? (
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
                            onClick={() => startEdit(gate)}
                            style={{ fontSize: "14px", padding: "8px 12px" }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn danger"
                            onClick={() => del(gate._id)}
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
            ))}
          </div>
        )}

        {filteredGates.length > 1 && (
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
            💡 Tip: Drag and drop gates to reorder them
          </div>
        )}
      </div>
    </div>
  );
}
