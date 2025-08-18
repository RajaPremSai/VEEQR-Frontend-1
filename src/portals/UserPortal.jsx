import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserDashboard from "../user/Dashboard";
import UserVehicles from "../user/Vehicles";
import UserLogs from "../user/Logs";
import UserAnnouncements from "../user/Announcements";
import UserProfile from "../user/Profile";

export default function UserPortal() {
  return (
    <div className="portal-layout" role="application" aria-label="User Portal">
      <NavBar />
      <main
        id="main-content"
        className="portal-content"
        role="main"
        aria-label="Main content area"
      >
        <div className="container">
          <Routes>
            <Route index element={<UserDashboard />} />
            <Route path="vehicles" element={<UserVehicles />} />
            <Route path="logs" element={<UserLogs />} />
            <Route path="announcements" element={<UserAnnouncements />} />
            <Route path="profile" element={<UserProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
