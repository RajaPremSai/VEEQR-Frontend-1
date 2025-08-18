import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import ManagerDashboard from "../manager/Dashboard";
import ManagerUsers from "../manager/Users";
import ManagerGates from "../manager/Gates";
import ManagerUniVehicles from "../manager/UniversityVehicles";
import ManagerPersonalVehicles from "../manager/PersonalVehicles";
import ManagerAnnouncements from "../manager/Announcements";
import ManagerGuards from "../manager/SecurityGuards";
import ManagerLogs from "../manager/Logs";

export default function ManagerPortal() {
  return (
    <div
      className="portal-layout"
      role="application"
      aria-label="Manager Portal"
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
            <Route index element={<ManagerDashboard />} />
            <Route path="users" element={<ManagerUsers />} />
            <Route path="gates" element={<ManagerGates />} />
            <Route path="u-vehicles" element={<ManagerUniVehicles />} />
            <Route
              path="personal-vehicles"
              element={<ManagerPersonalVehicles />}
            />
            <Route path="announcements" element={<ManagerAnnouncements />} />
            <Route path="guards" element={<ManagerGuards />} />
            <Route path="logs" element={<ManagerLogs />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
