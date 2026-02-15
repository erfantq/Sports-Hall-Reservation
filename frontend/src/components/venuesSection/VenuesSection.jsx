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
  import.meta.env.VITE_API_BASE_URL + "/api/halls/";

// function normalizeResponse(payload) {
//   const ok = payload?.status === true;
//   if (!ok) {
//     return { ok: false, message: payload?.message || "Request failed.", items: [], totalPages: 1 };
//   }

//   const d = payload?.data ?? {};
//   const items =
//     d.results || d.items || d.venues || d.data || d.list || (Array.isArray(d) ? d : []);

//   return { ok: true, message: payload?.message || "", items: Array.isArray(items) ? items : [], totalPages: 1 };
// }

function normalizeResponse(payload) {
  const ok = payload?.status === true;
  if (!ok) {
    return {
      ok: false,
      message: payload?.message || "Request failed.",
      items: [],
      totalPages: 1,
      page: 1,
    };
  }

  const items = payload.data.results;

  return {
    ok: true,
    message: payload?.message || "",
    items: items,
    totalPages: Math.ceil(Number(payload?.data?.total_items / payload?.data?.page_size)),
    page: Number(payload?.data?.page || 1),
  };
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
  const [loadingInitial, setLoadingInitial] = useState(false); // first page / refetch
  const [loadingMore, setLoadingMore] = useState(false);       // pagination
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const prefetchTargetRef = useRef(null);
  const observerRef = useRef(null);


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  const isPrefetchingRef = useRef(false);
  const savedScrollLeftRef = useRef(0);

  const PREFETCH_INDEX_FROM_END = 2;
  useEffect(() => {
    setPage(1);
    savedScrollLeftRef.current = 0;
  }, [query, sport]);


  useEffect(() => {
    const run = async () => {
      setError("");
      const isFirstPage = page === 1;
      if (isFirstPage) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Remember where the user currently is so we can restore only if needed (not used now but kept for future).
        savedScrollLeftRef.current = hScrollRef.current?.scrollLeft ?? 0;

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

        // setItems(normalized.items.slice(0, pageSize));

        setTotalPages(normalized.totalPages);

        setItems((prev) => {
          if (page === 1) return normalized.items;

          const seen = new Set(prev.map((x) => x.id));
          const merged = [...prev];
          for (const it of normalized.items) {
            if (!seen.has(it.id)) merged.push(it);
          }
          return merged;
        });

      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to load venues.");
        setItems([]);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
        isPrefetchingRef.current = false;

      }
    };

    const delay = query.trim() ? 500 : 0;
    const t = setTimeout(run, delay);

    return () => {
      clearTimeout(t);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, sport, page]);

  const sports = useMemo(() => {
    const s = new Set(items.map((v) => v?.sport).filter(Boolean));
    return ["All", ...Array.from(s)];
  }, [items]);

  useEffect(() => {
    const isFetching = loadingInitial || loadingMore;
    if (isFetching) return;
    if (page >= totalPages) return;

    const el = prefetchTargetRef.current;
    if (!el) return;

    observerRef.current?.disconnect();

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (isPrefetchingRef.current) return;
        if (loadingInitial || loadingMore) return;

        isPrefetchingRef.current = true;

        savedScrollLeftRef.current = hScrollRef.current?.scrollLeft ?? 0;

        setPage((p) => (p < totalPages ? p + 1 : p));
      },
      {
        root: hScrollRef.current, // ✅ چون اسکرول افقی داخل همین div است
        threshold: 0.6,
      }
    );

    obs.observe(el);
    observerRef.current = obs;

    return () => obs.disconnect();
  }, [items, loadingInitial, loadingMore, page, totalPages]);


  useEffect(() => {
    if (!loadingInitial && !loadingMore) {
      searchRef.current?.focus();
    }
  }, [loadingInitial, loadingMore]);

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
              disabled={loadingInitial && items.length === 0}
            />

            <Form.Select
              className="venues-select"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              disabled={loadingInitial && items.length === 0}
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

       <div className="venues-carousel-wrap">
  <div className="venues-carousel">
    <button
      type="button"
      className="venues-arrow venues-arrow-left"
      onClick={() => scrollByCard(-1)}
      aria-label="Scroll left"
      disabled={loadingInitial && items.length === 0}
    >
      <FiChevronLeft size={22} />
    </button>

    <div ref={hScrollRef} className="venues-hscroll" aria-label="Venues horizontal scroll">
      {items.map((v, idx) => (
        <div
          key={v.id}
          className="venues-snap-card"
          ref={idx === Math.max(0, items.length - (PREFETCH_INDEX_FROM_END + 1)) ? prefetchTargetRef : null}
        >
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
    </div>

    <button
      type="button"
      className="venues-arrow venues-arrow-right"
      onClick={() => scrollByCard(1)}
      aria-label="Scroll right"
      disabled={loadingInitial && items.length === 0}
    >
      <FiChevronRight size={22} />
    </button>
  </div>

  {/* ✅ فقط این spinner اضافه شد، بدون اینکه carousel حذف بشه */}
  {(loadingInitial && items.length === 0) && (
    <div className="venues-loading-overlay">
      <Spinner animation="border" role="status" />
    </div>
  )}
</div>

      </Container>
    </div>
  );
}
