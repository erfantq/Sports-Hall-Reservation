import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ConfirmModal({
  show,
  title = "Confirm",
  body = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title style={{ fontWeight: 900 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white">
        <div className="muted">{body}</div>
      </Modal.Body>
      <Modal.Footer className="bg-dark border-0">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button className="btn-white-glass" onClick={onConfirm} disabled={loading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
