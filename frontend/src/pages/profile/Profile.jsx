import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Table, Pagination, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const PAGE_SIZE = 6;
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const PROFILE_URL = `${API_BASE}/api/profile/`;
const BOOKINGS_URL = `${API_BASE}/api/bookings/my-history/`;

function normalizeUser(payload) {
  const data = payload?.data || payload || {};
  const user = data;
  return {
    username: user.username || "",
    email: user.email || "",
    role: user.role || "",
  };
}

function normalizeBookings(payload) {
  const ok = payload?.status === true || !!payload?.data || Array.isArray(payload);
  if (!ok) throw new Error(payload?.message || "Request failed.");

  const data = payload?.data || payload || {};
  const items = data.items || data.results || data.bookings || (Array.isArray(data) ? data : []);
  const totalCount = data.count || data.total || data.total_items || items.length;
  const totalPages = data.total_pages || (data.count && data.page_size ? Math.max(1, Math.ceil(data.count / data.page_size)) : 1);
  const serverPaginated = Boolean(data.total_pages || data.page || data.page_size);

  return {
    items: (items || []).map((b) => ({
      id: b.id,
      venueName: b.hallName || "-",
      sport: b.sport || "-",
      date: b.date,
      time: b.time,
      durationHours: b.durationHours,
      price: b.price || 0,
      status: (b.status || "pending").toString(),
    })),
    totalPages: totalPages || 1,
    serverPaginated,
    totalCount,
  };
}

export default function Profile() {
  const [tab, setTab] = useState("info"); // "info" | "bookings"

  const navigate = useNavigate();

  // ---- Personal info state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", role: "" });  
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // ---- Bookings state
  const [page, setPage] = useState(1);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [serverPaginated, setServerPaginated] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);

  const bookingsPage = useMemo(() => {
    if (serverPaginated) return bookings;
    const start = (page - 1) * PAGE_SIZE;
    return bookings.slice(start, start + PAGE_SIZE);
  }, [page, bookings, serverPaginated]);

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

    const run = async () => {
      try {
        const res = await fetch(PROFILE_URL, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: "include",
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            role: form.role,
          }),
        });

        const payload = await res.json();
        if (!payload?.status) throw new Error(payload?.message || "Update failed.");

        const normalized = normalizeUser(payload);
        setUser(normalized);
        setForm(normalized);
        setIsEditing(false);
        setSaveMsg("Profile updated successfully.");
      } catch (err) {
        setSaveMsg("");
        setUserError(err?.message || "Failed to update profile.");
      } finally {
        setUserLoading(false);
        setUserError("");
      }
    };

    run();
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      setUserError("");
      setUserLoading(true);
      try {
        const res = await fetch(PROFILE_URL, {
          method: "GET",
          headers: { Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          credentials: "include",
          signal: controller.signal,
        });
        const payload = await res.json();
        if (!payload?.status) throw new Error(payload?.message || "Failed to load profile.");
        const normalized = normalizeUser(payload);
        setUser(normalized);
        setForm(normalized);
      } catch (err) {
        if (err.name === "AbortError") return;
        setUserError(err?.message || "Failed to load profile.");
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadBookings = async () => {
      setBookingsError("");
      setBookingsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page_size", PAGE_SIZE);
        params.set("page", page);

        const res = await fetch(`${BOOKINGS_URL}?${params.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const normalized = normalizeBookings(payload);

        setBookings(normalized.items);
        const derivedTotalPages = normalized.serverPaginated
          ? normalized.totalPages || 1
          : Math.max(1, Math.ceil((normalized.totalCount || normalized.items.length) / PAGE_SIZE));
        setTotalPages(derivedTotalPages);
        setServerPaginated(normalized.serverPaginated);
        setBookingsCount(normalized.totalCount || normalized.items.length);
      } catch (err) {
        if (err.name === "AbortError") return;
        setBookingsError(err?.message || "Failed to load bookings.");
        setBookings([]);
        setTotalPages(1);
        setServerPaginated(false);
        setBookingsCount(0);
      } finally {
        setBookingsLoading(false);
      }
    };

    loadBookings();
    return () => controller.abort();
  }, [page]);

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
                            if (user) setForm(user);
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

                  {userError && <Alert variant="danger" className="mt-3 mb-0">{userError}</Alert>}
                  {saveMsg && !userError && <Alert variant="success" className="mt-3 mb-0">{saveMsg}</Alert>}

                  <Form id="profile-form" className="mt-4" onSubmit={onSave}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label className="form-label-dark">Username</Form.Label>
                        <Form.Control
                          className="dark-input"
                          value={form.username}
                          disabled={!isEditing || userLoading}
                          onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label className="form-label-dark">Email</Form.Label>
                        <Form.Control
                          className="dark-input"
                          type="email"
                          value={form.email}
                          disabled={!isEditing || userLoading}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </Col>

                      <Col md={12}>
                        <Form.Label className="form-label-dark">Role</Form.Label>
                        <Form.Control
                          className="dark-input"
                          value={form.role}
                          disabled
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                        />
                      </Col>
                    </Row>
                  </Form>

                  {userLoading && (
                    <div className="d-flex align-items-center gap-2 text-white-50 mt-3">
                      <Spinner animation="border" size="sm" role="status" />
                      <span>Loading profile...</span>
                    </div>
                  )}
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
                    <span className="text-white fw-semibold">{bookingsCount || bookings.length}</span>
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

              {bookingsError && <Alert variant="danger" className="mb-3">{bookingsError}</Alert>}

              <div className="table-wrap">
                <Table responsive className="profile-table mb-0" borderless>
                  <thead>
                    <tr>
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
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="d-flex justify-content-center py-4">
                            <Spinner animation="border" role="status" />
                          </div>
                        </td>
                      </tr>
                    ) : bookingsPage.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center muted py-4">No bookings found.</td>
                      </tr>
                    ) : (
                      bookingsPage.map((b) => (
                        <tr key={b.id}>
                          <td className="text-white fw-semibold">{b.venueName}</td>
                          <td className="muted">{b.sport}</td>
                          <td className="muted">{b.date}</td>
                          <td className="muted">{b.time}</td>
                          <td className="muted">{b.durationHours}</td>
                          <td className="text-white fw-semibold">${b.price}</td>
                          <td>{statusBadge(b.status)}</td>
                        </tr>
                      ))
                    )}
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
