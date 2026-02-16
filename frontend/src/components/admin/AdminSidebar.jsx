import React from "react";
import { NavLink } from "react-router-dom";
import { FaUsers, FaChartBar, FaShieldAlt , FaBuilding , FaClipboardList , FaCalendar , FaUser } from "react-icons/fa";
import { MdInsights } from "react-icons/md";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const role = localStorage.getItem('role')

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-icon">
          <FaShieldAlt />
        </div>
        <div>
          <div className="admin-brand-title">Sporta {role}</div>
          <div className="admin-brand-sub">Management Panel</div>
        </div>
      </div>

      <nav className="admin-nav">
        {(role == 'sys-admin') && (
          <NavLink end to="/admin" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
            <FaChartBar className="admin-link-ico" />
            Dashboard
          </NavLink>
        )}

        {(role == 'sys-admin') && (
          <NavLink to="/admin/users" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
            <FaUsers className="admin-link-ico" />
            Users
          </NavLink>
        )}

        <NavLink to="/admin/venues" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <FaBuilding className="admin-link-ico" />
          Venues
        </NavLink>

        <NavLink to="/admin/bookings" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <FaClipboardList className="admin-link-ico" />
          Bookings
        </NavLink>

        <NavLink to="/admin/halls/usage-stats" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <MdInsights className="admin-link-ico" />
          Usage Stats
        </NavLink>

        {/* <NavLink to="/admin/reserves-count" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <FaCalendar className="admin-link-ico" />
          Reservations Count
        </NavLink>

        <NavLink to="/admin/active-users-count" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <FaUser className="admin-link-ico" />
          Active Users Count
        </NavLink> */}


      </nav>

      <div className="admin-sidebar-footer">
        <div className="muted small">© {new Date().getFullYear()} Sporta</div>
      </div>
    </aside>
  );
}
