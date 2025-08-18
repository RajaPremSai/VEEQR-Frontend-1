import { useEffect, useState } from "react";
import api from "../utils/api";

export default function GuardLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    direction: "",
    gate: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "timeIn",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [gates, setGates] = useState([]);

  useEffect(() => {
    loadLogs();
    loadGates();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [logs, filters, sortConfig]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/security-guards/logs");
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGates = async () => {
    try {
      const { data } = await api.get("/api/security-guards/gates");
      setGates(data.gates || []);
    } catch (error) {
      console.error("Failed to load gates:", error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...logs];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.vehicleNumber?.toLowerCase().includes(searchLower) ||
          log.vehicleOwner?.toLowerCase().includes(searchLower) ||
          log.gateNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.direction) {
      filtered = filtered.filter((log) => {
        if (filters.direction === "IN") return log.timeIn && !log.timeOut;
        if (filters.direction === "OUT") return log.timeOut;
        return true;
      });
    }

    if (filters.gate) {
      filtered = filtered.filter((log) => log.gateNumber === filters.gate);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timeIn || log.timeOut || log.createdAt);
        return logDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timeIn || log.timeOut || log.createdAt);
        return logDate <= toDate;
      });
    }

    if (filters.status) {
      filtered = filtered.filter((log) => {
        if (filters.status === "active") return log.timeIn && !log.timeOut;
        if (filters.status === "completed") return log.timeIn && log.timeOut;
        return true;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "timeIn" || sortConfig.key === "timeOut") {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectLog = (logId) => {
    setSelectedLogs((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAll = () => {
    const currentPageLogs = getCurrentPageLogs();
    const allSelected = currentPageLogs.every((log) =>
      selectedLogs.includes(log._id)
    );

    if (allSelected) {
      setSelectedLogs((prev) =>
        prev.filter((id) => !currentPageLogs.find((log) => log._id === id))
      );
    } else {
      setSelectedLogs((prev) => [
        ...new Set([...prev, ...currentPageLogs.map((log) => log._id)]),
      ]);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      direction: "",
      gate: "",
      dateFrom: "",
      dateTo: "",
      status: "",
    });
  };

  const exportLogs = () => {
    const logsToExport =
      selectedLogs.length > 0
        ? filteredLogs.filter((log) => selectedLogs.includes(log._id))
        : filteredLogs;

    const csvContent = [
      [
        "Log ID",
        "Vehicle Number",
        "Vehicle Owner",
        "Gate Number",
        "Entry Time",
        "Exit Time",
        "Duration",
        "Status",
      ],
      ...logsToExport.map((log) => {
        const entryTime = log.timeIn ? new Date(log.timeIn) : null;
        const exitTime = log.timeOut ? new Date(log.timeOut) : null;
        const duration =
          entryTime && exitTime
            ? Math.round((exitTime - entryTime) / (1000 * 60)) + " min"
            : "-";
        const status = log.timeIn && !log.timeOut ? "Active" : "Completed";

        return [
          log.logId || log._id.slice(-8),
          log.vehicleNumber,
          log.vehicleOwner || "N/A",
          log.gateNumber,
          entryTime ? entryTime.toLocaleString() : "-",
          exitTime ? exitTime.toLocaleString() : "-",
          duration,
          status,
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guard-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCurrentPageLogs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentPageLogs = getCurrentPageLogs();

  return (
    <div className="guard-logs-container">
      <div className="logs-header">
        <div className="header-content">
          <h2>Entry/Exit Logs</h2>
          <p>Manage and monitor vehicle logs for your assigned gates</p>
        </div>

        <div className="header-actions">
          <button
            className="btn secondary refresh-btn"
            onClick={loadLogs}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="btn export-btn"
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
          >
            <span className="btn-icon">📊</span>
            Export{" "}
            {selectedLogs.length > 0 ? `(${selectedLogs.length})` : "All"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              className="input filter-input"
              placeholder="Vehicle number, owner, or gate..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          <div className="filter-group">
            <label>Gate</label>
            <select
              className="input filter-select"
              value={filters.gate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, gate: e.target.value }))
              }
            >
              <option value="">All Gates</option>
              {gates.map((gate) => (
                <option key={gate._id} value={gate.gateNumber}>
                  {gate.gateName} ({gate.gateNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              className="input filter-select"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="active">Active (Inside)</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              className="input filter-input"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
              }
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              className="input filter-input"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn secondary clear-btn" onClick={clearFilters}>
            <span className="btn-icon">✖️</span>
            Clear Filters
          </button>

          <div className="results-count">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLogs.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedLogs.length} logs selected</span>
          </div>
          <div className="bulk-buttons">
            <button
              className="btn secondary"
              onClick={() => setSelectedLogs([])}
            >
              Clear Selection
            </button>
            <button className="btn export-btn" onClick={exportLogs}>
              <span className="btn-icon">📊</span>
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="logs-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No logs found</h3>
            <p>
              No logs match your current filters or you haven't been assigned
              any gates yet.
            </p>
            <button className="btn secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={
                          currentPageLogs.length > 0 &&
                          currentPageLogs.every((log) =>
                            selectedLogs.includes(log._id)
                          )
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th
                      className={`sortable ${
                        sortConfig.key === "vehicleNumber"
                          ? sortConfig.direction
                          : ""
                      }`}
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      Vehicle Number
                      <span className="sort-indicator">
                        {sortConfig.key === "vehicleNumber"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </span>
                    </th>
                    <th>Owner</th>
                    <th
                      className={`sortable ${
                        sortConfig.key === "gateNumber"
                          ? sortConfig.direction
                          : ""
                      }`}
                      onClick={() => handleSort("gateNumber")}
                    >
                      Gate
                      <span className="sort-indicator">
                        {sortConfig.key === "gateNumber"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </span>
                    </th>
                    <th
                      className={`sortable ${
                        sortConfig.key === "timeIn" ? sortConfig.direction : ""
                      }`}
                      onClick={() => handleSort("timeIn")}
                    >
                      Entry Time
                      <span className="sort-indicator">
                        {sortConfig.key === "timeIn"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </span>
                    </th>
                    <th
                      className={`sortable ${
                        sortConfig.key === "timeOut" ? sortConfig.direction : ""
                      }`}
                      onClick={() => handleSort("timeOut")}
                    >
                      Exit Time
                      <span className="sort-indicator">
                        {sortConfig.key === "timeOut"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕️"}
                      </span>
                    </th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageLogs.map((log) => {
                    const entryTime = log.timeIn ? new Date(log.timeIn) : null;
                    const exitTime = log.timeOut ? new Date(log.timeOut) : null;
                    const duration =
                      entryTime && exitTime
                        ? Math.round((exitTime - entryTime) / (1000 * 60)) +
                          " min"
                        : "-";
                    const status =
                      log.timeIn && !log.timeOut ? "active" : "completed";

                    return (
                      <tr
                        key={log._id}
                        className={`log-row ${
                          selectedLogs.includes(log._id) ? "selected" : ""
                        } ${status}`}
                      >
                        <td className="checkbox-column">
                          <input
                            type="checkbox"
                            checked={selectedLogs.includes(log._id)}
                            onChange={() => handleSelectLog(log._id)}
                          />
                        </td>
                        <td className="vehicle-number">
                          <strong>{log.vehicleNumber}</strong>
                        </td>
                        <td className="owner-name">
                          {log.vehicleOwner || "N/A"}
                        </td>
                        <td className="gate-number">
                          <span className="gate-badge">{log.gateNumber}</span>
                        </td>
                        <td className="entry-time">
                          {entryTime ? (
                            <div className="time-display">
                              <div className="time-value">
                                {entryTime.toLocaleTimeString()}
                              </div>
                              <div className="date-value">
                                {entryTime.toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="no-data">-</span>
                          )}
                        </td>
                        <td className="exit-time">
                          {exitTime ? (
                            <div className="time-display">
                              <div className="time-value">
                                {exitTime.toLocaleTimeString()}
                              </div>
                              <div className="date-value">
                                {exitTime.toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="no-data">-</span>
                          )}
                        </td>
                        <td className="duration">
                          <span className="duration-badge">{duration}</span>
                        </td>
                        <td className="status">
                          <span className={`status-badge ${status}`}>
                            {status === "active" ? "🟢 Inside" : "🔵 Completed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn secondary pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="btn secondary pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
