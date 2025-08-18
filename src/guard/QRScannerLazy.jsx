import { lazy, Suspense } from "react";

// Lazy load the QR scanner component to reduce initial bundle size
const QRScanner = lazy(() => import("./QRScanner"));

// Loading component for QR scanner
function QRScannerLoading() {
  return (
    <div className="qr-scanner-loading">
      <div className="scanner-loading-container">
        <div className="scanner-loading-icon">📱</div>
        <h3>Loading QR Scanner...</h3>
        <p>Initializing camera and scanning components</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}

export default function QRScannerLazy() {
  return (
    <Suspense fallback={<QRScannerLoading />}>
      <QRScanner />
    </Suspense>
  );
}
