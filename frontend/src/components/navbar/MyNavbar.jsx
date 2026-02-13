import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./MyNavbar.css";
import { useNavigate } from "react-router-dom";

function MyNavbar() {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate("/profile");
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Navbar
      expand="md"
      data-bs-theme="dark"
      className="my-navbar glass-nav rounded-pill"
    >
      <Container className="px-3">
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <img src={logo} alt="sporta-logo" className="logo" />
        </Navbar.Brand>

        {/* Hamburger */}
        <Navbar.Toggle aria-controls="main-navbar" className="nav-toggle" />

        <Navbar.Collapse id="main-navbar">
          {/* Left side (desktop): main links */}
          <Nav className="me-auto nav-links">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="#venues">Venues</Nav.Link>
            <Nav.Link as={Link} to="#pricing">Pricing</Nav.Link>
          </Nav>

          {/* Right side (desktop): auth links */}
          {localStorage.getItem("access_token") && (
            <Nav className="ms-auto nav-auth">
              <Nav.Link onClick={handleProfile} className="nav-auth-link">
                Profile
              </Nav.Link>
              <Nav.Link onClick={handleLogout} className="nav-auth-link">
                Logout
              </Nav.Link>
            </Nav>
          )}
          {!localStorage.getItem("access_token") && (
            <Nav className="ms-auto nav-auth">
              <Nav.Link as={Link} to="/login" className="nav-auth-link">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="nav-auth-link">
                Register
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
