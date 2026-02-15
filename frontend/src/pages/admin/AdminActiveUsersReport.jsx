import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import "./AdminReservesReport.css"; 

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/admin/users/active-count";

export default function AdminActiveUsersReport() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCount(null);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const payload = await res.json();
      if (!payload?.status) throw new Error(payload?.message || "Request failed.");

      setCount(payload?.data?.count ?? 0);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-report-page">
      <Container>
        <Card className="glass-card">
          <Card.Body>
            <h2 className="section-title mb-3">Active Users Report</h2>

            <Form onSubmit={onSubmit}>
              <div className="d-flex flex-wrap gap-3 align-items-end">
                <Form.Group>
                  <Form.Label className="form-label-dark">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="dark-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="form-label-dark">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="dark-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>

                <Button type="submit" className="btn-white-glass" disabled={loading}>
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </div>
            </Form>

            {error && (
              <Alert variant="danger" className="mt-4">
                {error}
              </Alert>
            )}

            {count !== null && !error && (
              <div className="report-result mt-4">
                <div className="report-box">
                  <span className="report-number">{count}</span>
                  <span className="report-label">Active users in selected period</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-4 d-flex align-items-center gap-2 text-white-50">
                <Spinner animation="border" size="sm" />
                Fetching data...
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
