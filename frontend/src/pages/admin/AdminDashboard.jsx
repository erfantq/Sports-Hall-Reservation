import React from "react";
import { Card } from "react-bootstrap";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-white mb-2" style={{ fontWeight: 900 }}>Dashboard</h1>
      <p className="muted mb-4">Overview of your platform (reports will be added next).</p>

      <Card className="glass-card">
        <Card.Body className="text-white">
          Next: Reports widgets (Bookings, Active users, Utilization).
        </Card.Body>
      </Card>
    </div>
  );
}
