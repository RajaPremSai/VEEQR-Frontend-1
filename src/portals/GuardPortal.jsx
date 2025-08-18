import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import GuardDashboard from "../guard/Dashboard";
import GuardLogs from "../guard/Logs";
import QRScannerLazy from "../guard/QRScannerLazy";
import GuardProfile from "../guard/Profile";
import GuardGates from "../guard/Gates";
import GuardAnnouncements from "../guard/Announcements";

export default function GuardPortal() {
  return (
    <div
      className="portal-layout"
      role="application"
      aria-label="Security Guard Portal"
    >
      <NavBar />
      <main
        id="main-content"
        className="portal-content"
        role="main"
        aria-label="Main content area"
      >
        <div className="container">
          <Routes>
            <Route index element={<GuardDashboard />} />
            <Route path="scanner" element={<QRScannerLazy />} />
            <Route path="logs" element={<GuardLogs />} />
            <Route path="gates" element={<GuardGates />} />
            <Route path="announcements" element={<GuardAnnouncements />} />
            <Route path="profile" element={<GuardProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
