import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function VenueFacilitiesModal({
  show,
  loading = false,
  venue = null,
  allFacilities = [],
  onClose,
  onSave,
}) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!show) return;
    setSelected(Array.isArray(venue?.facilities) ? venue.facilities : []);
  }, [show, venue]);

  const toggle = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  };

  const count = useMemo(() => selected.length, [selected]);

  const save = () => {
    onSave?.(selected);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title style={{ fontWeight: 900 }}>
          Facilities — {venue?.name || ""}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-white">
        <div className="muted mb-3">Select available facilities for this venue. ({count} selected)</div>

        <div className="facilities-grid">
          {allFacilities.map((f) => (
            <label key={f} className={`facility-chip ${selected.includes(f) ? "active" : ""}`}>
              <Form.Check
                type="checkbox"
                checked={selected.includes(f)}
                onChange={() => toggle(f)}
                disabled={loading}
                className="facility-check"
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-dark border-0">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button className="btn-white-glass" onClick={save} disabled={loading}>
          Save facilities
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
