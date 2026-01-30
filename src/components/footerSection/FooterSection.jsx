import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./FooterSection.css";
import { FiInstagram, FiTwitter, FiYoutube, FiMail } from "react-icons/fi";

function FooterSection() {
  return (
    <footer className="footer-section">
      <Container>
        <div className="footer-card">
          <Row className="gy-4 align-items-start">
            <Col lg={4}>
              <div className="footer-brand">
                <div className="footer-logo">Sporta</div>
                <p className="footer-muted mb-0">
                  Book sports venues in seconds. Discover nearby courts, compare prices,
                  and reserve your slot instantly.
                </p>
              </div>
            </Col>

            <Col sm={6} lg={2}>
              <div className="footer-title">Product</div>
              <ul className="footer-links">
                <li><a href="#venues">Venues</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </Col>

            <Col sm={6} lg={2}>
              <div className="footer-title">Company</div>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </Col>

            <Col lg={4}>
              <div className="footer-title">Get updates</div>
              <div className="footer-muted mb-3">
                Monthly tips, venue drops, and product updates.
              </div>

              <Form className="footer-newsletter">
                <Form.Control
                  type="email"
                  placeholder="Email address"
                  className="footer-input"
                />
                <Button className="btn-white-glass" type="button">
                  Subscribe
                </Button>
              </Form>

              <div className="footer-social">
                <a href="#ig" aria-label="Instagram"><FiInstagram /></a>
                <a href="#tw" aria-label="Twitter"><FiTwitter /></a>
                <a href="#yt" aria-label="YouTube"><FiYoutube /></a>
                <a href="mailto:hello@sporta.com" aria-label="Email"><FiMail /></a>
              </div>
            </Col>
          </Row>

          <div className="footer-bottom">
            <span className="footer-muted">© {new Date().getFullYear()} Sporta. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default FooterSection;
