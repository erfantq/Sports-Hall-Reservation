import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function CancelBookingModal({
  show,
  booking = null,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!show) return;
    setReason("");
  }, [show]);

  const submit = () => {
    onConfirm?.(reason.trim());
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title style={{ fontWeight: 900 }}>Cancel booking</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-white">
        <div className="muted mb-3">
          Cancel booking #{booking?.id} for <span className="text-white fw-semibold">{booking?.venue?.name}</span>?
        </div>

      </Modal.Body>

      <Modal.Footer className="bg-dark border-0">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Close
        </Button>
        <Button className="btn-white-glass" onClick={submit} disabled={loading}>
          Confirm cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
