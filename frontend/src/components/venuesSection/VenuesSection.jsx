import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Card,
  Badge,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import "./VenuesSection.css";
import { fetchVenuesMock } from "../../api/venues.api";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";


const API_URL =
  import.meta.env.VITE_API_BASE_URL + "/api/halls";

function normalizeResponse(payload) {
  const ok = payload?.status === true;
  if (!ok) {
    return { ok: false, message: payload?.message || "Request failed.", items: [], totalPages: 1 };
  }

  const d = payload?.data ?? {};
  const items =
    d.results || d.items || d.venues || d.data || d.list || (Array.isArray(d) ? d : []);

  return { ok: true, message: payload?.message || "", items: Array.isArray(items) ? items : [], totalPages: 1 };
}

export default function VenuesSection() {
    const hScrollRef = useRef(null);
    const searchRef = useRef(null);

    const defaultImage = "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=60";

    const scrollByCard = (dir) => {
      const el = hScrollRef.current;
      if (!el) return;

      const step = Math.max(260, Math.floor(el.clientWidth * 0.85));
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    };


  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);

  let page = 1;
  const pageSize = 6;

  useEffect(() => {
    const run = async () => {
      setError("");
      setLoading(true);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("page_size", String(pageSize));
        if (query.trim()) params.set("search", query.trim());
        if (sport !== "All") params.set("sport", sport);

        const USE_MOCK = false;

        let payload;
        if (USE_MOCK) {
          payload = await fetchVenuesMock({
            page,
            page_size: pageSize,
            search: query,
            sport,
          });
        } else {
          const res = await fetch(`${API_URL}?${params.toString()}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          payload = await res.json();
        }

        const normalized = normalizeResponse(payload);
        if (!normalized.ok) throw new Error(normalized.message);

        setItems(normalized.items.slice(0, pageSize));
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to load venues.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    const delay = query.trim() ? 500 : 0;
    const t = setTimeout(run, delay);

    return () => {
      clearTimeout(t);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, sport]);

  const sports = useMemo(() => {
    const s = new Set(items.map((v) => v?.sport).filter(Boolean));
    return ["All", ...Array.from(s)];
  }, [items]);

  useEffect(() => {
    if (!loading) {
      searchRef.current?.focus();
    }
  }, [loading]);

  return (
    <div className="venues-section">
      <Container>
        <div className="d-flex flex-wrap gap-3 align-items-end justify-content-between mb-4">
          <div>
            <h2 className="text-white mb-1">Available Venues</h2>
            <p className="text-white-50 mb-0">Swipe to explore venues.</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Form.Control
              ref={searchRef}
              className="venues-search"
              placeholder="Search by name or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />

            <Form.Select
              className="venues-select"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              disabled={loading}
            >
              {["All", "Football", "Basketball", "Volleyball"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : (
          <div className="venues-carousel">
  <button
  type="button"
  className="venues-arrow venues-arrow-left"
  onClick={() => scrollByCard(-1)}
  aria-label="Scroll left"
>
  <FiChevronLeft size={22} />
</button>

  <div ref={hScrollRef} className="venues-hscroll" aria-label="Venues horizontal scroll">
    {items.map((v) => (
      <div key={v.id} className="venues-snap-card">
        <Card className="venue-card h-100 border-0">
          <div className="venue-image-wrap">
            <img src={v.image ?? defaultImage} alt={v.name} className="venue-image" />
          </div>

          <Card.Body className="d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Card.Title className="text-white mb-1">{v.name}</Card.Title>
                  <div className="text-white-50 small">
                    {v.city} • {v.sport}
                  </div>
                </div>
                <Badge bg="secondary">{v.rating}</Badge>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-3">
                {(v.tags || []).map((t) => (
                  <Badge key={t} bg="dark" text="light" className="venue-tag">
                    {t}
                  </Badge>
                ))}
              </div>

            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-white">
                <span className="fw-semibold">${v.pricePerHour}</span>
                <span className="text-white-50"> / hour</span>
              </div>
              <Button as={Link} to={`/venues/${v.id}`} className="btn-white-glass">
                Book now
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    ))}

    {items.length === 0 && !error && (
      <div className="text-center text-white-50 py-5 w-100">
        No venues found.
      </div>
    )}
  </div>

  <button
  type="button"
  className="venues-arrow venues-arrow-right"
  onClick={() => scrollByCard(1)}
  aria-label="Scroll right"
>
  <FiChevronRight size={22} />
</button>
</div>

        )}
      </Container>
    </div>
  );
}
