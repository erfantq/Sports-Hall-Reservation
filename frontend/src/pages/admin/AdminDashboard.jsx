import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const RESERVES_COUNT_URL = `${API_BASE}/api/halls/reserves-count`;

const ACTIVE_USERS_URL = `${API_BASE}/api/admin/users/active-count`;

const getTodayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function AdminDashboard() {
  const [startDate, setStartDate] = useState(() => "2026-01-01");
  const [endDate, setEndDate] = useState(() => getTodayISO());

  const [loading, setLoading] = useState(false);

  const [reservesCount, setReservesCount] = useState(null);
  const [activeUsersCount, setActiveUsersCount] = useState(null);

  const [reservesError, setReservesError] = useState("");
  const [activeUsersError, setActiveUsersError] = useState("");

  const fetchCount = async (url, params) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${url}?${qs}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload?.status) throw new Error(payload?.message || "Request failed.");
    return payload?.data?.count ?? 0;
  };

  const onGenerate = async (e) => {
    e.preventDefault();

    setReservesError("");
    setActiveUsersError("");

    setReservesCount(null);
    setActiveUsersCount(null);

    if (!startDate || !endDate) {
      setReservesError("Please select both start and end dates.");
      setActiveUsersError("Please select both start and end dates.");
      return;
    }

    try {
      setLoading(true);

      const params = { start_date: startDate, end_date: endDate };

      // parallel requests
      const [rc, au] = await Promise.allSettled([
        fetchCount(RESERVES_COUNT_URL, params),
        fetchCount(ACTIVE_USERS_URL, params),
      ]);

      if (rc.status === "fulfilled") setReservesCount(rc.value);
      else setReservesError(rc.reason?.message || "Failed to load reserves count.");

      if (au.status === "fulfilled") setActiveUsersCount(au.value);
      else setActiveUsersError(au.reason?.message || "Failed to load active users count.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-white mb-2" style={{ fontWeight: 900 }}>
        Dashboard
      </h1>
      <p className="muted mb-4">Overview of your platform.</p>

      {/* Filters */}
      <Card className="glass-card mb-4">
        <Card.Body>
          <Form onSubmit={onGenerate}>
            <div className="d-flex flex-wrap gap-3 align-items-end justify-content-between">
              <div className="d-flex flex-wrap gap-3 align-items-end">
                <Form.Group>
                  <Form.Label className="form-label-dark">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="dark-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="form-label-dark">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="dark-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Button type="submit" className="btn-white-glass" disabled={loading}>
                  {loading ? "Loading..." : "Generate"}
                </Button>
              </div>

              {loading && (
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <Spinner animation="border" size="sm" />
                  Fetching widgets...
                </div>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Widgets */}
      <div className="d-flex flex-wrap gap-4">
        {/* Reservations Count */}
        <Card className="glass-card flex-grow-1" style={{ minWidth: 280 }}>
          <Card.Body>
            <div className="muted mb-2">Reservations Count</div>

            {reservesError && <Alert variant="danger" className="mb-3">{reservesError}</Alert>}

            <div className="text-white" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
              {reservesCount === null ? "—" : reservesCount}
            </div>

            <div className="muted mt-2">Total reservations in selected period</div>
          </Card.Body>
        </Card>

        {/* Active Users Count */}
        <Card className="glass-card flex-grow-1" style={{ minWidth: 280 }}>
          <Card.Body>
            <div className="muted mb-2">Active Users</div>

            {activeUsersError && <Alert variant="danger" className="mb-3">{activeUsersError}</Alert>}

            <div className="text-white" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
              {activeUsersCount === null ? "—" : activeUsersCount}
            </div>

            <div className="muted mt-2">Active users in selected period</div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
