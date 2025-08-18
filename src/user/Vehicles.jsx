import { useEffect, useState } from "react";
import api from "../utils/api";

export default function UserVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "Car",
    vehicleModelName: "",
    vehicleOwner: "",
    driverName: "",
    driverMobileNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users/vehicles");
      setVehicles(data.vehicles || []);
      setFilteredVehicles(data.vehicles || []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter and search vehicles
  useEffect(() => {
    let filtered = vehicles;

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter((v) => v.vehicleType === filterType);
    }

    // Search by vehicle number, model, or owner
    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.vehicleModelName &&
            v.vehicleModelName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          v.vehicleOwner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filterType]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    }

    if (!form.vehicleOwner.trim()) {
      newErrors.vehicleOwner = "Vehicle owner is required";
    }

    if (
      form.driverMobileNumber &&
      !/^\d{10}$/.test(form.driverMobileNumber.replace(/\D/g, ""))
    ) {
      newErrors.driverMobileNumber =
        "Please enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/users/vehicles", form);
      setForm({
        vehicleNumber: "",
        vehicleType: "Car",
        vehicleModelName: "",
        vehicleOwner: "",
        driverName: "",
        driverMobileNumber: "",
      });
      setErrors({});
      setShowAddForm(false);
      await load();
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (qrImageUrl, vehicleNumber) => {
    if (qrImageUrl) {
      const fullUrl = qrImageUrl.startsWith("http")
        ? qrImageUrl
        : `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }${qrImageUrl}`;
      const link = document.createElement("a");
      link.href = fullUrl;
      link.download = `QR_${vehicleNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getQRImageUrl = (qrImageUrl) => {
    if (!qrImageUrl) return null;
    return qrImageUrl.startsWith("http")
      ? qrImageUrl
      : `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }${qrImageUrl}`;
  };

  const getVehicleIcon = (type) => {
    const icons = {
      Car: "🚗",
      Bike: "🏍️",
      Scooter: "🛵",
      Bus: "🚌",
      Other: "🚙",
    };
    return icons[type] || "🚙";
  };

  const vehicleTypes = ["All", "Car", "Bike", "Scooter", "Bus", "Other"];

  return (
    <div className="vehicles-container">
      {/* Header Section */}
      <div className="vehicles-header">
        <div className="header-content">
          <h1 className="page-title">My Vehicles</h1>
          <p className="page-subtitle">
            Manage your registered vehicles and QR codes
          </p>
        </div>
        <button
          className="btn primary add-vehicle-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <span className="btn-icon">➕</span>
          Add Vehicle
        </button>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <div className="add-vehicle-section">
          <div className="form-card">
            <div className="form-header">
              <h3 className="form-title">Add New Vehicle</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                  setForm({
                    vehicleNumber: "",
                    vehicleType: "Car",
                    vehicleModelName: "",
                    vehicleOwner: "",
                    driverName: "",
                    driverMobileNumber: "",
                  });
                }}
              >
                ✕
              </button>
            </div>

            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <form onSubmit={submit} className="vehicle-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Number *</label>
                  <input
                    className={`form-input ${
                      errors.vehicleNumber ? "error" : ""
                    }`}
                    value={form.vehicleNumber || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        vehicleNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., MH12AB1234"
                    required
                  />
                  {errors.vehicleNumber && (
                    <span className="field-error">{errors.vehicleNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Type</label>
                  <select
                    className="form-input"
                    value={form.vehicleType || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vehicleType: e.target.value }))
                    }
                  >
                    <option value="Car">🚗 Car</option>
                    <option value="Bike">🏍️ Bike</option>
                    <option value="Scooter">🛵 Scooter</option>
                    <option value="Bus">🚌 Bus</option>
                    <option value="Other">🚙 Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Model</label>
                  <input
                    className="form-input"
                    value={form.vehicleModelName || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        vehicleModelName: e.target.value,
                      }))
                    }
                    placeholder="e.g., Honda City, Yamaha R15"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Owner *</label>
                  <input
                    className={`form-input ${
                      errors.vehicleOwner ? "error" : ""
                    }`}
                    value={form.vehicleOwner || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vehicleOwner: e.target.value }))
                    }
                    placeholder="Owner's full name"
                    required
                  />
                  {errors.vehicleOwner && (
                    <span className="field-error">{errors.vehicleOwner}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Name</label>
                  <input
                    className="form-input"
                    value={form.driverName || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, driverName: e.target.value }))
                    }
                    placeholder="Driver's name (if different from owner)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Mobile</label>
                  <input
                    className={`form-input ${
                      errors.driverMobileNumber ? "error" : ""
                    }`}
                    value={form.driverMobileNumber || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        driverMobileNumber: e.target.value,
                      }))
                    }
                    placeholder="10-digit mobile number"
                    type="tel"
                  />
                  {errors.driverMobileNumber && (
                    <span className="field-error">
                      {errors.driverMobileNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setErrors({});
                    setForm({
                      vehicleNumber: "",
                      vehicleType: "Car",
                      vehicleModelName: "",
                      vehicleOwner: "",
                      driverName: "",
                      driverMobileNumber: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      Add Vehicle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="vehicles-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by vehicle number, model, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">Filter by type:</label>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type === "All"
                  ? "All Types"
                  : `${getVehicleIcon(type)} ${type}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="vehicles-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading vehicles...</span>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <div className="empty-title">
              {vehicles.length === 0
                ? "No vehicles registered"
                : "No vehicles match your search"}
            </div>
            <div className="empty-description">
              {vehicles.length === 0
                ? "Add your first vehicle to get started with QR-based entry/exit tracking"
                : "Try adjusting your search terms or filters"}
            </div>
            {vehicles.length === 0 && (
              <button
                className="btn primary"
                onClick={() => setShowAddForm(true)}
              >
                <span className="btn-icon">➕</span>
                Add Your First Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-header">
                  <div className="vehicle-icon">
                    {getVehicleIcon(vehicle.vehicleType)}
                  </div>
                  <div className="vehicle-number">{vehicle.vehicleNumber}</div>
                  <div className="vehicle-type-badge">
                    {vehicle.vehicleType}
                  </div>
                </div>

                <div className="vehicle-details">
                  <div className="detail-row">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">
                      {vehicle.vehicleModelName || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Owner:</span>
                    <span className="detail-value">{vehicle.vehicleOwner}</span>
                  </div>
                  {vehicle.driverName && (
                    <div className="detail-row">
                      <span className="detail-label">Driver:</span>
                      <span className="detail-value">{vehicle.driverName}</span>
                    </div>
                  )}
                  {vehicle.driverMobileNumber && (
                    <div className="detail-row">
                      <span className="detail-label">Mobile:</span>
                      <span className="detail-value">
                        {vehicle.driverMobileNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="vehicle-qr-section">
                  {vehicle.qr?.imageUrl ? (
                    <div className="qr-available">
                      <div className="qr-preview">
                        <img
                          src={getQRImageUrl(vehicle.qr.imageUrl)}
                          alt={`QR Code for ${vehicle.vehicleNumber}`}
                          className="qr-image"
                        />
                      </div>
                      <div className="qr-actions">
                        <a
                          href={getQRImageUrl(vehicle.qr.imageUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn secondary small"
                        >
                          <span className="btn-icon">👁️</span>
                          View
                        </a>
                        <button
                          onClick={() =>
                            downloadQR(
                              vehicle.qr.imageUrl,
                              vehicle.vehicleNumber
                            )
                          }
                          className="btn primary small"
                        >
                          <span className="btn-icon">⬇️</span>
                          Download
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="qr-generating">
                      <div className="qr-placeholder">
                        <div className="loading-spinner small"></div>
                      </div>
                      <span className="qr-status">Generating QR Code...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {!loading && vehicles.length > 0 && (
        <div className="results-summary">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
          {searchTerm && ` matching "${searchTerm}"`}
          {filterType !== "All" && ` filtered by ${filterType}`}
        </div>
      )}
    </div>
  );
}
