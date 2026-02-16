import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Form, Row, Col, Table, Pagination, Spinner, Alert } from "react-bootstrap";
import "./UsageStatsAdmin.css";

const ANIM_MS = 180;

export default function UsageStatsAdmin() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [sport, setSport] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [configCities, setConfigCities] = useState([]);
  const [configSports, setConfigSports] = useState([]);
  const [configLoading, setConfigLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const abortRef = useRef(null);
  const configAbortRef = useRef(null);
  const searchRef = useRef(null);

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
  }, [query, city, sport, startDate, endDate]);

  const loadConfig = async () => {
    setConfigLoading(true);
    if (configAbortRef.current) configAbortRef.current.abort();
    const controller = new AbortController();
    configAbortRef.current = controller;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/halls/config/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        signal: controller.signal,
      });
      const payload = await res.json();
      if (!res.ok || !payload?.status) throw new Error(payload?.message || "Failed to load config.");
      setConfigCities(payload.data?.cities || []);
      setConfigSports(payload.data?.sports || []);
    } catch (e) {
      console.log("loadConfig error:", e);
      setConfigCities([]);
      setConfigSports([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const load = async () => {
    setError("");
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("page_size", pageSize);
      if (query.trim()) params.set("search", query.trim());
      if (city && city !== "All") params.set("city", city);
      if (sport && sport !== "All") params.set("sport", sport);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/admin/halls/usage-stats/?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        signal: controller.signal,
      });

      const payload = await res.json();
      if (!res.ok || !payload?.status) throw new Error(payload?.message || "Request failed.");

      const list = payload.data || [];
      const totalItems = payload.total_items ?? list.length ?? 0;
      const effectivePageSize = payload.page_size || pageSize;
      const computedTotalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));

      setItems(list);
      setTotalPages(computedTotalPages);
      if (page > computedTotalPages) setPage(computedTotalPages);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load usage stats.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    return () => {
      configAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const delay = query.trim() ? 500 : 0;
    const t = setTimeout(() => {
      load();
    }, delay);

    return () => {
      clearTimeout(t);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, city, sport, startDate, endDate]);

  useEffect(() => {
    if (!loading) {
      searchRef.current?.focus();
    }
  }, [loading]);

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

  const utilization = (row) => {
    const total = Number(row.total_slots) || 0;
    const used = (Number(row.reserved_slots) || 0) + (Number(row.pending_slots) || 0);
    if (!total) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <div>
      <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h1 className="text-white mb-1" style={{ fontWeight: 900 }}>
            Hall Usage Stats
          </h1>
          <div className="muted">Track utilization across halls with filters and pagination.</div>
        </div>
      </div>

      <Card className="glass-card">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <Form.Label className="form-label-dark">Search</Form.Label>
              <Form.Control
                ref={searchRef}
                className="dark-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by hall / city / sport..."
                disabled={loading || configLoading}
              />
            </Col>

            <Col md={4} lg={2}>
              <Form.Label className="form-label-dark">City</Form.Label>
              <Form.Select
                className="dark-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading || configLoading}
              >
                {["All", ...configCities].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Label className="form-label-dark">Sport</Form.Label>
              <Form.Select
                className="dark-input"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                disabled={loading || configLoading}
              >
                {["All", ...configSports].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Label className="form-label-dark">Start date</Form.Label>
              <Form.Control
                type="date"
                className="dark-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </Col>

            <Col md={4} lg={2}>
              <Form.Label className="form-label-dark">End date</Form.Label>
              <Form.Control
                type="date"
                className="dark-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}

          <div className="admin-glass-wrapper mt-3">
            <Table responsive className={`admin-glass-table ${isAnimating ? `is-animating ${direction}` : ""}`}>
              <thead>
                <tr>
                  <th>Hall</th>
                  <th>City</th>
                  <th>Sport</th>
                  <th>Total slots</th>
                  <th>Reserved</th>
                  <th>Pending</th>
                  <th>Cancelled</th>
                  <th>Available</th>
                  <th>Utilization</th>
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
                      <div className="text-center muted py-4">No stats found.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((row, idx) => {
                    const util = utilization(row);
                    return (
                      <tr key={`${row.name}-${idx}`}>
                        <td className="text-white fw-semibold">{row.name}</td>
                        <td className="text-white muted">{row.city}</td>
                        <td className="text-white muted">{row.sport}</td>
                        <td className="text-white">{row.total_slots}</td>
                        <td className="text-white">{row.reserved_slots}</td>
                        <td className="text-white">{row.pending_slots}</td>
                        <td className="text-white">{row.cancelled_slots}</td>
                        <td className="text-white">{row.available_slots}</td>
                        <td>
                          <div className="util-badge">
                            <div className="util-bar" style={{ width: `${Math.min(util, 100)}%` }} />
                            <span className="util-text">{util}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Pagination className="venues-pagination">{paginationItems}</Pagination>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
