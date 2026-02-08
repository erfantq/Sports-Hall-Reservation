import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/profile/Profile";
import VenueDetails from "./pages/venueDetails/VenueDetails";
import ContactSupport from "./pages/contactSupport/ContactSupport";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersAdmin from "./pages/admin/UsersAdmin";
// import VenuesAdmin from "./pages/admin/VenuesAdmin";
// import BookingsAdmin from "./pages/admin/BookingsAdmin";
// import ScheduleAdmin from "./pages/admin/ScheduleAdmin";
// import ReportsAdmin from "./pages/admin/ReportsAdmin";

// نمونه: نقش کاربر را از context/store بگیر
const useAuth = () => ({ role: "admin" });

function AdminGuard({ children }) {
  const { role } = useAuth();
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/venues/:id" element={<VenueDetails />} />
      <Route path="/contact-support" element={<ContactSupport />} />

      <Route path="*" element={<Navigate to="/" replace />} />

      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersAdmin />} />
        {/* <Route path="venues" element={<VenuesAdmin />} /> */}
        {/* <Route path="bookings" element={<BookingsAdmin />} /> */}
        {/* <Route path="schedule" element={<ScheduleAdmin />} /> */}
        {/* <Route path="reports" element={<ReportsAdmin />} /> */}
      </Route>

    </Routes>
  );
}
