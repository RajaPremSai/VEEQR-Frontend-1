import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import api from "../utils/api";

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [gates, setGates] = useState([]);
  const [form, setForm] = useState({ gateNumber: "", direction: "IN" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSuccessPulse, setHasSuccessPulse] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const scannerContainerRef = useRef(null);

  useEffect(() => {
    loadGates();
    return () => stopScanning();
  }, []);

  const loadGates = async () => {
    try {
      const { data } = await api.get("/api/security-guards/gates");
      setGates(data.gates || []);
      if ((data.gates || [])[0])
        setForm((f) => ({ ...f, gateNumber: data.gates[0].gateNumber }));
    } catch (error) {
      console.error("Failed to load gates:", error);
    }
  };

  const enterFullscreen = async () => {
    try {
      if (
        scannerContainerRef.current &&
        scannerContainerRef.current.requestFullscreen
      ) {
        await scannerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log("Fullscreen not supported or denied");
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.log("Exit fullscreen failed");
    }
  };

  const startScanning = async () => {
    try {
      setMsg("Initializing camera...");
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      setScanning(true);
      setResult(null);
      setVehicleDetails(null);
      setScanCount(0);

      // Request fullscreen for mobile experience
      if (window.innerWidth <= 768) {
        await enterFullscreen();
      }

      const videoInputDevices =
        await BrowserMultiFormatReader.listVideoInputDevices();
      const backCam = videoInputDevices.find((d) =>
        /back|rear|environment/i.test(d.label)
      );
      const deviceId = backCam
        ? backCam.deviceId
        : videoInputDevices[0]?.deviceId;

      if (!deviceId) {
        throw new Error("No camera found");
      }

      setMsg("Camera ready - Point at QR code");

      await codeReader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err, controls) => {
          if (result) {
            controls.stop();
            setHasSuccessPulse(true);
            setTimeout(() => setHasSuccessPulse(false), 1000);
            handleScan(result.getText());
            setScanCount((prev) => prev + 1);
          }
        }
      );
      setMsg("");
    } catch (error) {
      console.error("Failed to start scanning:", error);
      setMsg("Camera access failed. Please check permissions and try again.");
      setScanning(false);
      setIsFullscreen(false);
    }
  };

  const stopScanning = async () => {
    try {
      codeReaderRef.current?.reset();
    } catch {}
    setScanning(false);
    if (isFullscreen) {
      await exitFullscreen();
    }
  };

  const simulateQRScan = async () => {
    await handleScan("KA01AB1234");
  };

  const handleScan = async (qrData) => {
    try {
      setLoading(true);
      setMsg("Processing QR code...");

      // Accept both raw vehicle numbers and signed JSON payloads
      let vehicleNumber = (qrData || "").trim();
      if (!vehicleNumber) {
        setMsg("Empty QR data - Please try again");
        setLoading(false);
        return;
      }

      // If it looks like JSON, try to parse { payload, signature } -> payload -> { vehicleNumber }
      if (vehicleNumber.startsWith("{") || vehicleNumber.startsWith("[")) {
        try {
          const parsed = JSON.parse(qrData);
          const payload =
            typeof parsed.payload === "string"
              ? JSON.parse(parsed.payload)
              : parsed.payload;
          vehicleNumber = payload?.vehicleNumber || "";
        } catch (e) {
          console.error("QR JSON parse failed:", e);
          vehicleNumber = (qrData || "").trim();
        }
      }

      if (!vehicleNumber) {
        setMsg("Unable to extract vehicle number from QR code");
        setLoading(false);
        return;
      }

      // Mock data for testing
      if (vehicleNumber === "TEST123") {
        const mockVehicle = {
          vehicleNumber: "TEST123",
          vehicleType: "Car",
          vehicleOwner: "Test User",
          driverName: "Test Driver",
          driverMobileNumber: "+91 9876543210",
        };
        setVehicleDetails(mockVehicle);
        setResult(qrData);
        setMsg("✅ Test vehicle found!");
        setLoading(false);
        return;
      }

      if (vehicleNumber === "KA01AB1234") {
        const mockVehicle = {
          vehicleNumber: "KA01AB1234",
          vehicleType: "Car",
          vehicleOwner: "John Doe",
          driverName: "John Doe",
          driverMobileNumber: "+91 9876543210",
        };
        setVehicleDetails(mockVehicle);
        setResult(qrData);
        setMsg("✅ Vehicle found!");
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(
          `/api/security-guards/vehicles/${vehicleNumber}`
        );
        if (data.vehicle) {
          setVehicleDetails(data.vehicle);
          setResult(qrData);
          setMsg("✅ Vehicle verified!");
        } else {
          setMsg("❌ Vehicle not found in database");
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        setMsg(`⚠️ Vehicle ${vehicleNumber} scanned (API unavailable)`);
        const basicVehicle = {
          vehicleNumber: vehicleNumber,
          vehicleType: "Unknown",
          vehicleOwner: "Unknown",
          driverName: "Unknown",
          driverMobileNumber: "N/A",
        };
        setVehicleDetails(basicVehicle);
        setResult(qrData);
      }
    } catch (error) {
      console.error("Failed to process QR:", error);
      setMsg("❌ Failed to process QR code");
    } finally {
      setLoading(false);
    }
  };

  const submitLog = async (e) => {
    e.preventDefault();
    if (!result || !vehicleDetails)
      return setMsg("Please scan a QR code first.");
    setLoading(true);
    setMsg("Submitting log entry...");

    try {
      const payload = { ...form };
      let includeQrData = false;
      try {
        const parsed = JSON.parse(result);
        if (parsed && parsed.payload && parsed.signature) includeQrData = true;
      } catch {}

      if (includeQrData) {
        payload.qrData = result;
      } else {
        payload.vehicleNumber = vehicleDetails.vehicleNumber;
      }

      await api.post("/api/security-guards/logs", payload);
      setMsg(
        `✅ Successfully logged ${form.direction} for ${vehicleDetails.vehicleNumber}`
      );

      // Reset for next scan
      setTimeout(() => {
        setResult(null);
        setVehicleDetails(null);
        setMsg("");
      }, 3000);
    } catch (error) {
      setMsg(`❌ ${error?.response?.data?.message || "Failed to log entry"}`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setVehicleDetails(null);
    setMsg("");
    setScanCount(0);
  };

  return (
    <div className="qr-scanner-container">
      {!scanning ? (
        <div className="scanner-start-screen">
          <div className="scanner-header">
            <h2>QR Code Scanner</h2>
            <p>Scan vehicle QR codes for quick entry/exit logging</p>
          </div>

          <div className="scanner-instructions">
            <div className="instruction-item">
              <div className="instruction-icon">📱</div>
              <div className="instruction-text">
                <h4>Position Device</h4>
                <p>Hold your device steady and point camera at QR code</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="instruction-icon">🎯</div>
              <div className="instruction-text">
                <h4>Align QR Code</h4>
                <p>Center the QR code within the scanning frame</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="instruction-icon">✨</div>
              <div className="instruction-text">
                <h4>Auto Detection</h4>
                <p>Scanner will automatically detect and process the code</p>
              </div>
            </div>
          </div>

          <div className="scanner-actions">
            <button className="btn scanner-start-btn" onClick={startScanning}>
              <span className="btn-icon">📷</span>
              Start Camera Scanner
            </button>
            <button className="btn secondary test-btn" onClick={simulateQRScan}>
              <span className="btn-icon">🧪</span>
              Test with Sample QR
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={scannerContainerRef}
          className={`scanner-active-container ${
            isFullscreen ? "fullscreen" : ""
          }`}
        >
          <div className="scanner-header-active">
            <div className="scanner-status">
              <div className="status-indicator active"></div>
              <span>Camera Active</span>
            </div>
            <div className="scan-counter">Scans: {scanCount}</div>
          </div>

          <div className="scanner-viewport">
            <video
              ref={videoRef}
              className={`scanner-video ${
                hasSuccessPulse ? "scan-success" : ""
              }`}
              muted
              playsInline
            />

            <div className="scanner-overlay">
              <div className="scanner-frame">
                <div className="frame-corner top-left"></div>
                <div className="frame-corner top-right"></div>
                <div className="frame-corner bottom-left"></div>
                <div className="frame-corner bottom-right"></div>
                <div className="scanning-line"></div>
              </div>

              <div className="scanner-instructions-overlay">
                <p>Position QR code within the frame</p>
              </div>
            </div>

            {loading && (
              <div className="scanner-loading-overlay">
                <div className="loading-spinner"></div>
                <p>Processing QR Code...</p>
              </div>
            )}
          </div>

          <div className="scanner-controls">
            <button className="btn danger stop-btn" onClick={stopScanning}>
              <span className="btn-icon">⏹️</span>
              Stop Scanner
            </button>

            {result && (
              <button
                className="btn secondary reset-btn"
                onClick={resetScanner}
              >
                <span className="btn-icon">🔄</span>
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Confirmation */}
      {result && vehicleDetails && (
        <div className="scan-result-card">
          <div className="result-header">
            <div className="success-icon">✅</div>
            <h3>QR Code Scanned Successfully</h3>
          </div>

          <div className="vehicle-info-card">
            <div className="vehicle-number">{vehicleDetails.vehicleNumber}</div>
            <div className="vehicle-details-grid">
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  {vehicleDetails.vehicleType}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Owner:</span>
                <span className="detail-value">
                  {vehicleDetails.vehicleOwner}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Driver:</span>
                <span className="detail-value">
                  {vehicleDetails.driverName || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mobile:</span>
                <span className="detail-value">
                  {vehicleDetails.driverMobileNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="log-entry-form">
            <h4>Complete Entry Log</h4>
            <form onSubmit={submitLog} className="entry-form">
              <div className="form-row-scanner">
                <div className="form-group-scanner">
                  <label>Select Gate</label>
                  <select
                    className="input scanner-select"
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

                <div className="form-group-scanner">
                  <label>Direction</label>
                  <select
                    className="input scanner-select direction-select"
                    value={form.direction}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, direction: e.target.value }))
                    }
                    required
                  >
                    <option value="IN">🔽 Entry (IN)</option>
                    <option value="OUT">🔼 Exit (OUT)</option>
                  </select>
                </div>
              </div>

              <button
                className="btn submit-log-btn"
                type="submit"
                disabled={loading || !form.gateNumber}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📝</span>
                    Log {form.direction === "IN" ? "Entry" : "Exit"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {msg && (
        <div
          className={`scanner-message ${
            msg.includes("✅")
              ? "success"
              : msg.includes("❌")
              ? "error"
              : msg.includes("⚠️")
              ? "warning"
              : "info"
          }`}
        >
          <p>{msg}</p>
        </div>
      )}
    </div>
  );
}
