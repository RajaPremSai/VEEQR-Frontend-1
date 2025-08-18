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
    <div className="portal-layout">
      <NavBar />
      <main className="portal-content">
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
