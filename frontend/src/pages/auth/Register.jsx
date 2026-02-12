import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import MyLightRays from "../../components/lightRays/MyLightRays";
import "./Auth.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if(password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    } 

    try {
      setLoading(true); 

      const res = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            role,
          }),
        }
      );

      const payload = await res.json();

      if (!payload.status) {
        throw new Error(payload.message || "Registration failed");
      }

      console.log("Registration successful:", payload.data);

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }

    console.log("register:", { username, email, password, confirmPassword });
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
              <Form.Label className="auth-label">Username </Form.Label>
              <Form.Control
                className="auth-input"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
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

            <Form.Group className="mb-3">
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
            
            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Confirm Password</Form.Label>
              <Form.Control
                className="auth-input"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="auth-label">Role</Form.Label>
              <Form.Select
                className="dark-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="venue-manager">Venue Manager</option>
              </Form.Select>
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
