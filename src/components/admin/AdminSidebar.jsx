import React from "react";
import { NavLink } from "react-router-dom";
import { FaUsers, FaChartBar, FaShieldAlt } from "react-icons/fa";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-icon">
          <FaShieldAlt />
        </div>
        <div>
          <div className="admin-brand-title">Sporta Admin</div>
          <div className="admin-brand-sub">Management Panel</div>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink end to="/admin" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <FaChartBar className="admin-link-ico" />
          Dashboard
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}>
          <FaUsers className="admin-link-ico" />
          Users
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="muted small">© {new Date().getFullYear()} Sporta</div>
      </div>
    </aside>
  );
}
