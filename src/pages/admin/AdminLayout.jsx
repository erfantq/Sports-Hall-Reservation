import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
