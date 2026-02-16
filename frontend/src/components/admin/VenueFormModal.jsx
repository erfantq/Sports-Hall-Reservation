import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function VenueFormModal({
  show,
  mode = "create", // "create" | "edit"
  initialVenue = null,
  loading = false,
  cities = [],
  sports = [],
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    sport: "",
    pricePerHour: "",
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
        address: initialVenue.address || "",
        city: initialVenue.city || "",
        sport: initialVenue.sport || "",
        pricePerHour: initialVenue.pricePerHour ?? "",
        rating: initialVenue.rating ?? "",
        cover_image: initialVenue.cover_image || "",
        is_active: initialVenue.is_active ?? true,
      });
    } else {
      setForm({
        name: "",
        address: "",
        city: "",
        sport: "",
        pricePerHour: "",
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
    if (!form.address.trim()) return setErr("Address is required.");
    if (!form.city.trim()) return setErr("City is required.");
    if (cities.length && !cities.includes(form.city)) return setErr("Please select a valid city.");
    if (!form.sport.trim()) return setErr("Sport is required.");
    if (sports.length && !sports.includes(form.sport)) return setErr("Please select a valid sport.");
    if (!String(form.pricePerHour).trim()) return setErr("Price per hour is required.");

    onSubmit?.({
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      sport: form.sport.trim(),
      pricePerHour: Number(form.pricePerHour),
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
            <Form.Label className="form-label-dark">Address</Form.Label>
            <Form.Control
              className="dark-input"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              disabled={loading}
              placeholder="1234 Main St, Suite 100"
            />
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">City</Form.Label>
            <Form.Select
              className="dark-input"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              disabled={loading || cities.length === 0}
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Sport</Form.Label>
            <Form.Select
              className="dark-input"
              value={form.sport}
              onChange={(e) => set("sport", e.target.value)}
              disabled={loading || sports.length === 0}
            >
              <option value="">Select a sport</option>
              {sports.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label className="form-label-dark">Price / hour</Form.Label>
            <Form.Control
              className="dark-input"
              type="number"
              value={form.pricePerHour}
              onChange={(e) => set("pricePerHour", e.target.value)}
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
