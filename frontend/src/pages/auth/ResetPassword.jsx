import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MyLightRays from "../../components/lightRays/MyLightRays";
import "./Auth.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // اگر از صفحه forgot-password ایمیل رو با navigate state پاس دادی، اینجا می‌گیریم
  const presetEmail = location.state?.email || "";

  const [email, setEmail] = useState(presetEmail); // بعضی بک‌اندها ایمیل هم لازم دارن
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) return setError("Please enter your email.");
    if (!code.trim()) return setError("Please enter the code sent to your email.");
    if (!newPassword.trim() || newPassword.trim().length < 6)
      return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);

      // ✅ این endpoint رو با بک‌اند هماهنگ کنید
      const res = await fetch(`${API_BASE}/api/verify-code/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          new_password: newPassword,
        }),
      });

      const payload = await res.json();

      if (!payload.status) {
        throw new Error(payload.message || "Reset password failed.");
      }

      setSuccess("Password changed successfully. Redirecting to login...");

      // بعد از موفقیت، بره لاگین
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.message || "Reset password error.");
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
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">
            Enter the code sent to your email and choose a new password.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

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
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Verification code</Form.Label>
              <Form.Control
                className="auth-input"
                type="text"
                placeholder="e.g. 384921"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="auth-label">New password</Form.Label>
              <Form.Control
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </Form.Group>

            <div className="auth-links">
              <Link to="/forgot-password">Resend code</Link>
              <Link to="/login">Back to login</Link>
            </div>

            <div className="auth-divider" />

            <Button type="submit" className="btn-white-glass w-100" disabled={loading}>
              {loading ? "Saving..." : "Set new password"}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}
