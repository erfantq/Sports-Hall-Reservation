import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import MyLightRays from "../../components/lightRays/MyLightRays";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    // TODO: call backend
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    console.log("login:", { email, password });
  };

  return (
    <div className="auth-page">
        <div className="light-rays">
            <MyLightRays />
        </div>
      <Container className="p-0">

        <div className="auth-card mx-auto">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Log in to continue.</p>

          {error && <Alert variant="danger">{error}</Alert>}

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

            <Form.Group className="mb-2">
              <Form.Label className="auth-label">Password</Form.Label>
              <Form.Control
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Group>

            <div className="auth-links">
              <Link to="/forgot-password">Forgot password?</Link>
              <Link to="/register">Create account</Link>
            </div>

            <div className="auth-divider" />

            <Button type="submit" className="btn-white-glass w-100">
              Log in
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}
