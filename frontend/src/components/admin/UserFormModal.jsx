import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ROLES = [
  { value: "user", label: "User" },
  { value: "venue_manager", label: "Venue manager" },
  { value: "admin", label: "Admin" },
];

export default function UserFormModal({
  show,
  mode = "create", // "create" | "edit"
  initialUser = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "user",
    is_active: true,
  });

  const [err, setErr] = useState("");

  useEffect(() => {
    if (!show) return;
    if (mode === "edit" && initialUser) {
      setForm({
        username: initialUser.username || "",
        email: initialUser.email || "",
        role: initialUser.role || "user",
        is_active: initialUser.is_active ?? true,
      });
    } else {
      setForm({ username: "", email: "", role: "user", is_active: true });
    }
    setErr("");
  }, [show, mode, initialUser]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    setErr("");

    if (!form.username.trim()) return setErr("Username is required.");
    if (!form.email.trim()) return setErr("Email is required.");

    onSubmit?.({
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
      is_active: form.is_active,
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title style={{ fontWeight: 900 }}>
          {mode === "create" ? "Add user" : "Edit user"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-white">
        {err && <div className="alert alert-danger">{err}</div>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Label className="form-label-dark">Username</Form.Label>
            <Form.Control
              className="dark-input"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="Username"
              disabled={loading}
            />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Email</Form.Label>
            <Form.Control
              className="dark-input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
            />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Role</Form.Label>
            <Form.Select
              className="dark-input"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              disabled={loading}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Status</Form.Label>
            <Form.Select
              className="dark-input"
              value={form.is_active ? "active" : "inactive"}
              onChange={(e) => set("is_active", e.target.value === "active")}
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-dark border-0">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button className="btn-white-glass" onClick={submit} disabled={loading}>
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
