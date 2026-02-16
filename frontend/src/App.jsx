import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/profile/Profile";
import VenueDetails from "./pages/venueDetails/VenueDetails";
import ContactSupport from "./pages/contactSupport/ContactSupport";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersAdmin from "./pages/admin/UsersAdmin";
import VenuesAdmin from "./pages/admin/VenuesAdmin";
import BookingsAdmin from "./pages/admin/BookingsAdmin";
import AdminReservesReport from "./pages/admin/AdminReservesReport";
import AdminActiveUsersReport from "./pages/admin/AdminActiveUsersReport";
import UsageStatsAdmin from "./pages/admin/UsageStatsAdmin";
// import ScheduleAdmin from "./pages/admin/ScheduleAdmin";
// import ReportsAdmin from "./pages/admin/ReportsAdmin";

const useAuth = () => ({ role: localStorage.getItem("role") });

function AdminGuard({ children }) {
  const { role } = useAuth();
  if (role !== "sys-admin") return <Navigate to="/" replace />;
  return children;
}

function AdminAndVenueManagerGuard({ children }) {
  const { role } = useAuth();
  if(role !== "sys-admin" && role !== "venue-manager") return <Navigate to="/" replace />;
  return children;
}

function UserGuard({ children }) {
  const { role } = useAuth();
  if(role !== "user") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/venues/:id" element={<VenueDetails />} />
      <Route path="/contact-support" element={<ContactSupport />} />

      <Route path="*" element={<Navigate to="/" replace />} />

      <Route
        path="/profile"
        element={
          <UserGuard>
            <Profile />
          </UserGuard>
        }
      />

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

        {/* <Route path="reserves-count" element={<AdminReservesReport />} /> */}
        {/* <Route path="active-users-count" element={<AdminActiveUsersReport />} /> */}
        {/* <Route path="schedule" element={<ScheduleAdmin />} /> */}
        {/* <Route path="reports" element={<ReportsAdmin />} /> */}
      </Route>

      <Route
          path="/admin"
          element={
            <AdminAndVenueManagerGuard>
              <AdminLayout />
            </AdminAndVenueManagerGuard>
          }
        >
          <Route path="venues" element={<VenuesAdmin />} />
          <Route path="bookings" element={<BookingsAdmin />} />
          <Route path="halls/usage-stats" element={<UsageStatsAdmin />} />
        </Route>
    </Routes>
  );
}
