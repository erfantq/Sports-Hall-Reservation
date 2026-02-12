import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import MyLightRays from "../../components/lightRays/MyLightRays";
import "./Auth.css";

export default function  Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const payload = await res.json();

      if (!payload.status) {
        throw new Error(payload.message || "Login failed");
      }

      console.log("login success:", payload.data);

      // نمونه ذخیره توکن (بعداً استفاده می‌کنی)
      // if (payload.data?.access) {
      //   localStorage.setItem("access_token", payload.data.access);
      // }

      // if (payload.data?.refresh) {
      //   localStorage.setItem("refresh_token", payload.data.refresh);
      // }

      navigate("/");

    } catch (err) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
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
