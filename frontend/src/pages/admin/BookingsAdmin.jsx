import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Form, Row, Col, Table, Badge, Spinner, Alert, Pagination } from "react-bootstrap";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./BookingsAdmin.css";

import { fetchBookingsMock, confirmBookingMock, cancelBookingMock } from "../../api/admin/bookings.api";
import ConfirmModal from "../../components/admin/ConfirmModal";
import CancelBookingModal from "../../components/admin/CancelBookingModal";

const ANIM_MS = 180;

export default function BookingsAdmin() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All"); // All | pending | confirmed | cancelled
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const abortRef = useRef(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const goToPage = (nextPage) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    if (clamped === page) return;

    setDirection(clamped > page ? "next" : "prev");
    setIsAnimating(true);
    window.setTimeout(() => {
      setPage(clamped);
      setIsAnimating(false);
    }, ANIM_MS);
  };

  // reset to page 1 on filter changes
  useEffect(() => {
    if (page !== 1) goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, from, to]);

  const load = async () => {
    setError("");
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = await fetchBookings({
        page,
        page_size: pageSize,
        search,
        status,
        from,
        to,
      });

      if (!payload?.status) throw new Error(payload?.message || "Request failed.");

      setItems(payload.data || []);
      setTotalPages(payload.total_pages || 1);

      if (page > (payload.total_pages || 1)) setPage(payload.total_pages || 1);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load bookings.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, from, to]);

  const fetchBookings = async (params) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params,
    });
    return await res.json();
  };

  const openConfirm = (b) => {
    setConfirmTarget(b);
    setShowConfirm(true);
  };

  const doConfirm = async () => {
    if (!confirmTarget) return;
    setMutating(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-halls/bookings/${confirmTarget.id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          status: "confirmed",
        }),
      });
      if (!res?.status) throw new Error(res?.message || "Confirm failed.");

      setShowConfirm(false);
      setConfirmTarget(null);
      await load();
    } catch (e) {
      setError(e?.message || "Confirm failed.");
    } finally {
      setMutating(false);
    }
  };

  const openCancel = (b) => {
    setCancelTarget(b);
    setShowCancel(true);
  };

  const doCancel = async (reason) => {
    if (!cancelTarget) return;
    setMutating(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-halls/bookings/${cancelTarget.id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });
      if (!res?.status) throw new Error(res?.message || "Cancel failed.");

      setShowCancel(false);
      setCancelTarget(null);
      await load();
    } catch (e) {
      setError(e?.message || "Cancel failed.");
    } finally {
      setMutating(false);
    }
  };

  const paginationItems = useMemo(() => {
    const nodes = [];
    const add = (p) =>
      nodes.push(
        <Pagination.Item key={p} active={p === page} onClick={() => goToPage(p)} disabled={loading || isAnimating}>
          {p}
        </Pagination.Item>
      );

    nodes.push(<Pagination.Prev key="prev" disabled={page === 1 || loading || isAnimating} onClick={() => goToPage(page - 1)} />);

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) add(p);
    } else {
      add(1);
      if (page > 3) nodes.push(<Pagination.Ellipsis key="e1" disabled />);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let p = start; p <= end; p++) add(p);
      if (page < totalPages - 2) nodes.push(<Pagination.Ellipsis key="e2" disabled />);
      add(totalPages);
    }

    nodes.push(<Pagination.Next key="next" disabled={page === totalPages || loading || isAnimating} onClick={() => goToPage(page + 1)} />);
    return nodes;
  }, [page, totalPages, loading, isAnimating]);

  const statusBadge = (st) => {
    const normalized = String(st ?? "pending").toLowerCase();
    const label = st ?? "pending";
    return <Badge bg="" className={`status-badge status-${normalized}`}>{label}</Badge>;
  };

  const canConfirm = (b) => String(b.status ?? "").toLowerCase() === "pending";
  const canCancel = (b) => {
    const normalized = String(b.status ?? "").toLowerCase();
    return normalized !== "cancelled" && normalized !== "canceled";
  };

  return (
    <div>
      <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h1 className="text-white mb-1" style={{ fontWeight: 900 }}>
            Bookings
          </h1>
          <div className="muted">Confirm or cancel bookings and filter by date.</div>
        </div>
      </div>

      <Card className="glass-card">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <Form.Label className="form-label-dark">Search</Form.Label>
              <Form.Control
                className="dark-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="User / email / venue / city / sport..."
                disabled={loading || mutating}
              />
            </Col>

            <Col md={4} lg={2}>
              <Form.Label className="form-label-dark">Status</Form.Label>
              <Form.Select className="dark-input" value={status} onChange={(e) => setStatus(e.target.value)} disabled={loading || mutating}>
                <option value="All">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>

            <Col md={4} lg={3}>
              <Form.Label className="form-label-dark">From</Form.Label>
              <Form.Control className="dark-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={loading || mutating} />
            </Col>

            <Col md={4} lg={3}>
              <Form.Label className="form-label-dark">To</Form.Label>
              <Form.Control className="dark-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={loading || mutating} />
            </Col>
          </Row>

          {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}

          <div className="admin-glass-wrapper mt-3">
            <Table responsive className={`admin-glass-table ${isAnimating ? `is-animating ${direction}` : ""}`}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Hours</th>
                  <th>Total</th>
                  <th>Status</th>
                  {localStorage.getItem("role") === "venue-manager" && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" role="status" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="text-center muted py-4">No bookings found.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((b) => (
                    <tr key={b.id}>
                      <td className="text-white muted">#{b.id}</td>

                      <td>
                        <div className="text-white fw-semibold">{b.userName}</div>
                        {/* <div className="muted small">{b.email}</div> */}
                      </td>

                      <td>
                        <div className="text-white fw-semibold">{b.hallName}</div>
    
                      </td>

                      <td className="text-white muted">{b.date}</td>
                      <td className="text-white muted">{b.time}</td>
                      <td className="text-white muted">{b.durationHours}</td>

                      <td className="text-white">
                        <span className="fw-semibold">${b.price}</span>
                      </td>

                      <td>{statusBadge(b.status)}</td>

                      {localStorage.getItem("role") === "venue-manager" && (
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <Button
                              variant="outline-light"
                              className="icon-btn"
                            onClick={() => openConfirm(b)}
                            disabled={mutating || !canConfirm(b)}
                            title="Confirm"
                          >
                            <FaCheck />
                          </Button>

                          <Button
                            variant="outline-light"
                            className="icon-btn danger"
                            onClick={() => openCancel(b)}
                            disabled={mutating || !canCancel(b)}
                            title="Cancel"
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </td>)}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Pagination className="venues-pagination">{paginationItems}</Pagination>
          </div>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={showConfirm}
        title="Confirm booking"
        body={`Confirm booking #${confirmTarget?.id}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        loading={mutating}
        onClose={() => setShowConfirm(false)}
        onConfirm={doConfirm}
      />

      <CancelBookingModal
        show={showCancel}
        booking={cancelTarget}
        loading={mutating}
        onClose={() => setShowCancel(false)}
        onConfirm={doCancel}
      />
    </div>
  );
}
