import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function VenueFormModal({
  show,
  mode = "create", // "create" | "edit"
  initialVenue = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: "",
    city: "",
    sport: "",
    price_per_hour: "",
    rating: "",
    cover_image: "",
    is_active: true,
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!show) return;

    if (mode === "edit" && initialVenue) {
      setForm({
        name: initialVenue.name || "",
        city: initialVenue.city || "",
        sport: initialVenue.sport || "",
        price_per_hour: initialVenue.price_per_hour ?? "",
        rating: initialVenue.rating ?? "",
        cover_image: initialVenue.cover_image || "",
        is_active: initialVenue.is_active ?? true,
      });
    } else {
      setForm({
        name: "",
        city: "",
        sport: "",
        price_per_hour: "",
        rating: "",
        cover_image: "",
        is_active: true,
      });
    }

    setErr("");
  }, [show, mode, initialVenue]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    setErr("");

    if (!form.name.trim()) return setErr("Name is required.");
    if (!form.city.trim()) return setErr("City is required.");
    if (!form.sport.trim()) return setErr("Sport is required.");
    if (!String(form.price_per_hour).trim()) return setErr("Price per hour is required.");

    onSubmit?.({
      name: form.name.trim(),
      city: form.city.trim(),
      sport: form.sport.trim(),
      price_per_hour: Number(form.price_per_hour),
      rating: form.rating === "" ? undefined : Number(form.rating),
      cover_image: form.cover_image.trim(),
      is_active: form.is_active,
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title style={{ fontWeight: 900 }}>
          {mode === "create" ? "Add venue" : "Edit venue"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-white">
        {err && <div className="alert alert-danger">{err}</div>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Label className="form-label-dark">Name</Form.Label>
            <Form.Control className="dark-input" value={form.name} onChange={(e) => set("name", e.target.value)} disabled={loading} />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">City</Form.Label>
            <Form.Control className="dark-input" value={form.city} onChange={(e) => set("city", e.target.value)} disabled={loading} />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Sport</Form.Label>
            <Form.Control className="dark-input" value={form.sport} onChange={(e) => set("sport", e.target.value)} disabled={loading} />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Price / hour</Form.Label>
            <Form.Control
              className="dark-input"
              type="number"
              value={form.price_per_hour}
              onChange={(e) => set("price_per_hour", e.target.value)}
              disabled={loading}
            />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Rating (optional)</Form.Label>
            <Form.Control
              className="dark-input"
              type="number"
              step="0.1"
              value={form.rating}
              onChange={(e) => set("rating", e.target.value)}
              disabled={loading}
            />
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

          <Col xs={12}>
            <Form.Label className="form-label-dark">Cover image URL (optional)</Form.Label>
            <Form.Control
              className="dark-input"
              value={form.cover_image}
              onChange={(e) => set("cover_image", e.target.value)}
              disabled={loading}
              placeholder="https://..."
            />
            <div className="muted small mt-2">
              (Optional) If empty, card will show a placeholder.
            </div>
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
