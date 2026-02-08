import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import MyLightRays from "../../components/lightRays/MyLightRays";
import "./Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    console.log("register:", { name, email, password });
  };

  return (
    <div className="auth-page">
        <div className="light-rays">
            <MyLightRays />
        </div>
      <Container className="p-0">
        <div className="auth-card mx-auto">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join Sporta in a few seconds.</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Full name</Form.Label>
              <Form.Control
                className="auth-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Form.Group>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <div className="auth-links">
              <Link to="/login">Already have an account?</Link>
            </div>

            <div className="auth-divider" />

            <Button type="submit" className="btn-white-glass w-100">
              Sign up
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}
