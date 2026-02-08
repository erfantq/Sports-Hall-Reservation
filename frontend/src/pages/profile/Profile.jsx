import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Table, Pagination, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const MOCK_USER = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+98 912 000 0000",
  city: "Tehran",
};

const MOCK_BOOKINGS = Array.from({ length: 23 }).map((_, i) => ({
  id: 1000 + i,
  venueName: ["Arena Fit Center", "Sky Court", "Pulse Club"][i % 3],
  sport: ["Football", "Basketball", "Volleyball"][i % 3],
  date: `2025-12-${String((i % 28) + 1).padStart(2, "0")}`,
  time: `${String((i % 12) + 8).padStart(2, "0")}:00`,
  durationHours: (i % 2) + 1,
  price: 320 + (i % 5) * 40,
  status: ["Confirmed", "Pending", "Canceled"][i % 3],
}));

const PAGE_SIZE = 6;

export default function Profile() {
  const [tab, setTab] = useState("info"); // "info" | "bookings"

  const navigate = useNavigate();

  // ---- Personal info state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(MOCK_USER);
  const [saveMsg, setSaveMsg] = useState("");

  // ---- Bookings state
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(MOCK_BOOKINGS.length / PAGE_SIZE));

  const bookingsPage = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return MOCK_BOOKINGS.slice(start, start + PAGE_SIZE);
  }, [page]);

  const goToPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  const statusBadge = (status) => {
    return (
        <Badge
        className={`profile-badge status-${status.toLowerCase()}`}
        >
        {status}
        </Badge>
    );
  };

  const onSave = (e) => {
    e.preventDefault();
    setSaveMsg("");

    // TODO: call backend
    setIsEditing(false);
    setSaveMsg("Profile updated successfully.");
  };

  return (
    <div className="profile-page">
      <Container>
        <div className="profile-header">
          <div>
            <h1 className="profile-title">Your Profile</h1>
            <p className="profile-subtitle">Manage your personal info and review your bookings.</p>
          </div>

          <div className="profile-tabs">
            <button
              type="button"
              className={`profile-tab ${tab === "info" ? "active" : ""}`}
              onClick={() => setTab("info")}
            >
              Personal Info
            </button>
            <button
              type="button"
              className={`profile-tab ${tab === "bookings" ? "active" : ""}`}
              onClick={() => setTab("bookings")}
            >
              Booking History
            </button>
          </div>
        </div>

        {tab === "info" && (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="glass-card">
                <Card.Body>
                  <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                    <div>
                      <h3 className="section-title mb-1">Personal Information</h3>
                      <div className="muted">Update your details to keep your account up to date.</div>
                    </div>

                    {!isEditing ? (
                      <Button className="btn-white-glass" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-light"
                          className="btn-outline-glass"
                          onClick={() => {
                            setIsEditing(false);
                            setForm(MOCK_USER);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button className="btn-white-glass" type="submit" form="profile-form">
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {saveMsg && <Alert variant="success" className="mt-3 mb-0">{saveMsg}</Alert>}

                  <Form id="profile-form" className="mt-4" onSubmit={onSave}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label className="form-label-dark">Full name</Form.Label>
                        <Form.Control
                          className="dark-input"
                          value={form.fullName}
                          disabled={!isEditing}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label className="form-label-dark">Email</Form.Label>
                        <Form.Control
                          className="dark-input"
                          type="email"
                          value={form.email}
                          disabled // ایمیل معمولاً قابل تغییر نیست
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label className="form-label-dark">Phone</Form.Label>
                        <Form.Control
                          className="dark-input"
                          value={form.phone}
                          disabled={!isEditing}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label className="form-label-dark">City</Form.Label>
                        <Form.Control
                          className="dark-input"
                          value={form.city}
                          disabled={!isEditing}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                        />
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="glass-card">
                <Card.Body>
                  <h3 className="section-title mb-3">Account</h3>
                  <div className="profile-kv">
                    <span className="muted">Member</span>
                    <span className="text-white fw-semibold">Sporta User</span>
                  </div>
                  <div className="profile-kv">
                    <span className="muted">Bookings</span>
                    <span className="text-white fw-semibold">{MOCK_BOOKINGS.length}</span>
                  </div>
                  <div className="profile-kv">
                    <span className="muted">Status</span>
                    <span className="text-white fw-semibold">Active</span>
                  </div>

                  <div className="profile-divider" />

                  <Button className="btn-outline-glass w-100" variant="outline-light" onClick={() => navigate("/forgot-password")}>
                    Change password
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {tab === "bookings" && (
          <Card className="glass-card">
            <Card.Body>
              <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
                <div>
                  <h3 className="section-title mb-1">Booking History</h3>
                  <div className="muted">Your recent reservations.</div>
                </div>

                <div className="muted">Page {page} / {totalPages}</div>
              </div>

              <div className="table-wrap">
                <Table responsive className="profile-table mb-0" borderless>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Venue</th>
                      <th>Sport</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Hours</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookingsPage.map((b) => (
                      <tr key={b.id}>
                        <td className="muted">#{b.id}</td>
                        <td className="text-white fw-semibold">{b.venueName}</td>
                        <td className="muted">{b.sport}</td>
                        <td className="muted">{b.date}</td>
                        <td className="muted">{b.time}</td>
                        <td className="muted">{b.durationHours}</td>
                        <td className="text-white fw-semibold">${b.price}</td>
                        <td>{statusBadge(b.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <Pagination className="venues-pagination">
                  <Pagination.Prev disabled={page === 1} onClick={() => goToPage(page - 1)} />
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <Pagination.Item key={p} active={p === page} onClick={() => goToPage(p)}>
                        {p}
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Next disabled={page === totalPages} onClick={() => goToPage(page + 1)} />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}
