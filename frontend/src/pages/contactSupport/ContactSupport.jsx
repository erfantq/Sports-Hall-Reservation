import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import "./ContactSupport.css";

export default function ContactSupport() {
  const [form, setForm] = useState({
    subject: "",
    type: "bug",
    priority: "medium",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.toLowerCase() });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.subject || !form.message) {
      return setError("Please fill all required fields.");
    }

    const payload = { subject: form.subject, type: form.type, priority: form.priority, message: form.message }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact/`, {
        method: "POST",
        headers: { 
          Accept: "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(payload),
      });
      const response = await res.json();
      if (!response?.status) throw new Error(response?.message || "Failed to send request.");
      setSuccess(`Request sent successfully.`);
    } catch (error) {
      setError(error.message);
    }
    setForm({ subject: "", type: "bug", priority: "medium", message: "" });
  };

  return (
    <div className="contact-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="glass-card">
              <Card.Body>
                <h2 className="section-title mb-2">Contact Management</h2>
                <p className="muted mb-4">
                  Report a problem or send a request to our management team.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={onSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Subject</Form.Label>
                    <Form.Control
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      placeholder="Short description of your issue"
                      className="dark-input"
                    />
                  </Form.Group>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label className="form-label-dark">Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={form.type}
                        onChange={onChange}
                        className="dark-input"
                      >
                        <option>Bug</option>
                        <option>Payment</option>
                        <option>Venue</option>
                        <option>Account</option>
                        <option>Other</option>
                      </Form.Select>
                    </Col>

                    <Col md={6}>
                      <Form.Label className="form-label-dark">Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={form.priority}
                        onChange={onChange}
                        className="dark-input"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  <Form.Group className="mt-3">
                    <Form.Label className="form-label-dark">Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      placeholder="Describe your issue in detail..."
                      className="dark-input"
                    />
                  </Form.Group>

                  <div className="mt-4">
                    <Button type="submit" className="btn-white-glass w-100">
                      Send Request
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
