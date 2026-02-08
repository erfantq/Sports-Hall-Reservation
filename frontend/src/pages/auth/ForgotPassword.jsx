import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import MyLightRays from "../../components/lightRays/MyLightRays";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    // TODO: call backend
    setMessage("If an account exists, a reset link will be sent to your email.");
  };

  return (
    <div className="auth-page">
        <div className="light-rays">
            <MyLightRays />
        </div>
      <Container className="p-0">
        <div className="auth-card mx-auto">
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">We’ll send you a reset link.</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Email</Form.Label>
              <Form.Control
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>

            <Button type="submit" className="btn-white-glass w-100">
              Send reset link
            </Button>

            <div className="auth-divider" />

            <div className="auth-links">
              <Link to="/login">Back to login</Link>
              <Link to="/register">Create account</Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
