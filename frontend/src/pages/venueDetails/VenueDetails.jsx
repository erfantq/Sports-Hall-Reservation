import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import "./VenueDetails.css";

const MOCK_VENUE = {
  id: 1,
  name: "Arena Fit Center",
  city: "Tehran",
  sport: "Football",
  rating: 4.7,
  pricePerHour: 450,
  image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=60",
  tags: ["Indoor", "Parking", "Showers", "Locker"],
  address: "Tehran, District 2, Example St. 12",
  description:
    "A modern indoor football arena with professional lighting, high-quality turf, lockers, showers and a comfortable lounge area.",
  slots: {
    "2025-12-31": ["10:00", "11:00", "13:00", "16:00", "18:00", "20:00"],
    "2026-01-01": ["09:00", "12:00", "14:00", "17:00", "19:00"],
    "2026-01-02": ["08:00", "10:00", "12:00", "15:00", "21:00"],
  }
};

// Mock availability: each date has time slots
const MOCK_SLOTS = {
  "2025-12-31": ["10:00", "11:00", "13:00", "16:00", "18:00", "20:00"],
  "2026-01-01": ["09:00", "12:00", "14:00", "17:00", "19:00"],
  "2026-01-02": ["08:00", "10:00", "12:00", "15:00", "21:00"],
};

export default function VenueDetails() {
  const { id } = useParams(); // later use this to fetch from backend

  const defaulImage = "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=60";

  const [selectedDate, setSelectedDate] = useState(Object.keys(MOCK_SLOTS)[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [hours, setHours] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [venueLoading, setVenueLoading] = useState(false);
  const [venue, setVenue] = useState({
      id: "",
      name: "",
      city: "",
      sport: "",
      rating: 0,
      pricePerHour: 0,
      image: defaulImage,
      tags: [],
      address: "",
      description: "",
      slots: MOCK_SLOTS,
    });

  const normalizeVenue = (payloadData) => {
    return {
      id: payloadData.id,
      name: payloadData.name,
      city: payloadData.city,
      sport: payloadData.sport,
      rating: payloadData.rating,
      pricePerHour: payloadData.pricePerHour,
      image: payloadData?.image ?? defaulImage,
      tags: payloadData.tags,
      address: payloadData.address,
      description: payloadData.description,
      slots: payloadData.slots,
    } 
  }
  
  const onBook = async () => {
    setError("");
    setMessage("");

    if (!selectedDate) return setError("Please choose a date.");
    if (!selectedTime) return setError("Please choose a time slot.");

    // TODO: call backend booking endpoint
    // payload example:
    payload = { venue_id: venue.id, date: selectedDate, time: selectedTime, hours }
    try {
      const res = await fetch(`/api/venues/${id}/book`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const payload = await res.json();
      if (!payload?.status) throw new Error(payload?.message || "Failed to book venue.");
      setMessage(`Booked successfully: ${selectedDate} at ${selectedTime} for ${hours} hour(s).`);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setVenueLoading(true);
    fetchVenue(controller.signal);

    return () => controller.abort();
  }, [id]);

  const fetchVenue = async (signal) => {
    try {
      const res = await fetch(`/api/venues/${id}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: signal,
      });
      const payload = await res.json();
      if (!payload?.status) throw new Error(payload?.message || "Failed to load venue.");
      const normalized = normalizeVenue(payload.data);
      setVenue(normalized);
      const firstDate = Object.keys(normalized.slots || {})[0] || "";
      setSelectedDate(firstDate);
      setSelectedTime("");
      setTotalPrice(normalized.pricePerHour);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
    } finally {
      setVenueLoading(false);
    }
  };

  return (
    <div className="venue-details-page">
      <Container>
        <Row className="g-4">
          {/* Left: Gallery + Info */}
          <Col lg={7}>
            <Card className="glass-card overflow-hidden">
              <div className="venue-hero-img">
                <img src={venue?.image ?? defaulImage} alt={venue?.name} />
              </div>

              <Card.Body>
                <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                  <div>
                    <h1 className="vd-title">{venue.name}</h1>
                    <div className="vd-sub">
                      {venue.city} • {venue.sport}
                    </div>
                  </div>

                  <div className="vd-rating">
                    <Badge className="vd-badge">{venue.rating}</Badge>
                    <div className="vd-price">
                      <span className="price">${venue.pricePerHour}</span>
                      <span className="muted"> / hour</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  {venue.tags.map((t) => (
                    <Badge key={t} className="tag-badge">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="vd-block mt-4">
                  <h3 className="section-title">About</h3>
                  <p className="muted mb-0">{venue.description}</p>
                </div>

                <div className="vd-block mt-4">
                  <h3 className="section-title">Address</h3>
                  <p className="muted mb-0">{venue.address}</p>
                </div>

                
              </Card.Body>
            </Card>
          </Col>

          {/* Right: Availability + Booking */}
          <Col lg={5}>
            <Card className="glass-card">
              <Card.Body>
                <h3 className="section-title mb-2">Available Times</h3>
                <div className="muted mb-3">Pick a date and a time slot to book.</div>

                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Date</Form.Label>
                  <Form.Select
                    className="dark-input"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                  >
                    {Object.keys(venue.slots[selectedDate]).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <div className="slots-grid">
                  {venue.slots[selectedDate].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`slot-btn ${selectedTime === t ? "active" : ""}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}

                  {venue.slots.length === 0 && (
                    <div className="muted">No available slots for this date.</div>
                  )}
                </div>

                <div className="vd-divider" />

                <h3 className="section-title mb-2">Book Online</h3>

                {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
                {message && <Alert variant="success" className="mt-2">{message}</Alert>}

                <Row className="g-3 mt-1">
                  <Col xs={12}>
                    <Form.Label className="form-label-dark">Duration (hours)</Form.Label>
                    <Form.Select
                      className="dark-input"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4].map((h) => (
                        <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col xs={12}>
                    <div className="total-row">
                      <span className="muted">Total</span>
                      <span className="total-price">${totalPrice}</span>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <Button className="btn-white-glass w-100" onClick={onBook}>
                      Confirm booking
                    </Button>
                  </Col>
                </Row>

                <div className="muted small mt-3">
                  By booking, you agree to the venue rules and cancellation policy.
                </div>
              </Card.Body>
            </Card>

            <Card className="glass-card mt-4">
              <Card.Body>
                <h3 className="section-title mb-2">Need help?</h3>
                <div className="muted mb-3">Contact support for any questions.</div>
                <Button as={Link} to="/contact-support" className="btn-outline-glass w-100" variant="outline-light">
                  Contact support
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
