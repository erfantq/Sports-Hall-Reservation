import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Form, Row, Col, Table, Badge, Spinner, Alert, Pagination } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaListUl } from "react-icons/fa";
import "./VenuesAdmin.css";

import {
  fetchVenuesMock,
  createVenueMock,
  updateVenueMock,
  deleteVenueMock,
  fetchFacilitiesMock,
  updateVenueFacilitiesMock,
} from "../../api/admin/venues.api";

import VenueFormModal from "../../components/admin/VenueFormModal";
import VenueFacilitiesModal from "../../components/admin/VenueFacilitiesModal";
import ConfirmModal from "../../components/admin/ConfirmModal";

const ANIM_MS = 180;
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=20";

export default function VenuesAdmin() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [sport, setSport] = useState("All");
  const [active, setActive] = useState("All"); // All | true | false

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [allFacilities, setAllFacilities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingVenue, setEditingVenue] = useState(null);

  const [showFacilities, setShowFacilities] = useState(false);
  const [facVenue, setFacVenue] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deletingVenue, setDeletingVenue] = useState(null);

  const abortRef = useRef(null);

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

  useEffect(() => {
    if (page !== 1) goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, city, sport, active]);

  const loadFacilities = async () => {
    try {
      const res = await fetchFacilitiesMock();
      if (res?.status) setAllFacilities(res.data.items || []);
    } catch {
      // ignore
    }
  };

  const load = async () => {
    setError("");
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = await fetchVenuesMock({
        page,
        page_size: pageSize,
        search: query,
        city,
        sport,
        is_active: active,
        signal: controller.signal,
      });

      if (!payload?.status) throw new Error(payload?.message || "Request failed.");

      setItems(payload.data.items || []);
      setTotalPages(payload.data.total_pages || 1);

      if (page > (payload.data.total_pages || 1)) setPage(payload.data.total_pages || 1);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load venues.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, city, sport, active]);

  const cities = useMemo(() => ["All", ...Array.from(new Set(items.map((v) => v.city).filter(Boolean)))], [items]);
  const sports = useMemo(() => ["All", ...Array.from(new Set(items.map((v) => v.sport).filter(Boolean)))], [items]);

  const openCreate = () => {
    setFormMode("create");
    setEditingVenue(null);
    setShowForm(true);
  };

  const openEdit = (v) => {
    setFormMode("edit");
    setEditingVenue(v);
    setShowForm(true);
  };

  const submitVenue = async (data) => {
    setMutating(true);
    setError("");

    try {
      if (formMode === "create") {
        const res = await createVenueMock({ ...data, facilities: [] });
        if (!res?.status) throw new Error(res?.message || "Create failed.");
      } else {
        const res = await updateVenueMock(editingVenue.id, data);
        if (!res?.status) throw new Error(res?.message || "Update failed.");
      }

      setShowForm(false);
      await load();
    } catch (e) {
      setError(e?.message || "Operation failed.");
    } finally {
      setMutating(false);
    }
  };

  const openFacilities = (v) => {
    setFacVenue(v);
    setShowFacilities(true);
  };

  const saveFacilities = async (facilities) => {
    if (!facVenue) return;
    setMutating(true);
    setError("");

    try {
      const res = await updateVenueFacilitiesMock(facVenue.id, facilities);
      if (!res?.status) throw new Error(res?.message || "Update facilities failed.");

      setShowFacilities(false);
      setFacVenue(null);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update facilities.");
    } finally {
      setMutating(false);
    }
  };

  const askDelete = (v) => {
    setDeletingVenue(v);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deletingVenue) return;
    setMutating(true);
    setError("");

    try {
      const res = await deleteVenueMock(deletingVenue.id);
      if (!res?.status) throw new Error(res?.message || "Delete failed.");

      setShowDelete(false);
      setDeletingVenue(null);

      if (items.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (e) {
      setError(e?.message || "Delete failed.");
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

  return (
    <div>
      <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h1 className="text-white mb-1" style={{ fontWeight: 900 }}>
            Venues
          </h1>
          <div className="muted">Add, edit venues and manage facilities.</div>
        </div>

        <Button className="btn-white-glass" onClick={openCreate} disabled={loading || mutating}>
          <FaPlus style={{ marginRight: 8 }} />
          Add venue
        </Button>
      </div>

      <Card className="glass-card">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <Form.Label className="form-label-dark">Search</Form.Label>
              <Form.Control
                className="dark-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name/city/sport..."
                disabled={loading || mutating}
              />
            </Col>

            <Col md={4} lg={3}>
              <Form.Label className="form-label-dark">City</Form.Label>
              <Form.Select className="dark-input" value={city} onChange={(e) => setCity(e.target.value)} disabled={loading || mutating}>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={3}>
              <Form.Label className="form-label-dark">Sport</Form.Label>
              <Form.Select className="dark-input" value={sport} onChange={(e) => setSport(e.target.value)} disabled={loading || mutating}>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Label className="form-label-dark">Status</Form.Label>
              <Form.Select className="dark-input" value={active} onChange={(e) => setActive(e.target.value)} disabled={loading || mutating}>
                <option value="All">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
          </Row>

          {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}

          <div className="admin-table-wrap mt-3">
            <Table responsive className={`admin-table ${isAnimating ? `is-animating ${direction}` : ""}`}>
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>City</th>
                  <th>Sport</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Facilities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" role="status" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="text-center muted py-4">No venues found.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className="venue-cell">
                          <img
                            className="venue-thumb"
                            src={v.cover_image || PLACEHOLDER_IMG}
                            alt={v.name}
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                          />
                          <div>
                            <div className="text-white fw-semibold">{v.name}</div>
                            <div className="muted small">#{v.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="muted">{v.city}</td>
                      <td className="muted">{v.sport}</td>
                      <td className="text-white">
                        <span className="fw-semibold">${v.price_per_hour}</span>
                        <span className="muted"> / hour</span>
                      </td>

                      <td>
                        <Badge className={`status-badge ${v.is_active ? "ok" : "off"}`}>
                          {v.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      <td>
                        <Badge className="fac-count-badge">
                          {(v.facilities || []).length} items
                        </Badge>
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Button variant="outline-light" className="icon-btn" onClick={() => openEdit(v)} disabled={mutating}>
                            <FaEdit />
                          </Button>

                          <Button variant="outline-light" className="icon-btn" onClick={() => openFacilities(v)} disabled={mutating}>
                            <FaListUl />
                          </Button>

                          <Button variant="outline-light" className="icon-btn danger" onClick={() => askDelete(v)} disabled={mutating}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
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

      <VenueFormModal
        show={showForm}
        mode={formMode}
        initialVenue={editingVenue}
        loading={mutating}
        onClose={() => setShowForm(false)}
        onSubmit={submitVenue}
      />

      <VenueFacilitiesModal
        show={showFacilities}
        venue={facVenue}
        allFacilities={allFacilities}
        loading={mutating}
        onClose={() => setShowFacilities(false)}
        onSave={saveFacilities}
      />

      <ConfirmModal
        show={showDelete}
        title="Delete venue"
        body={`Are you sure you want to delete "${deletingVenue?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={mutating}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
