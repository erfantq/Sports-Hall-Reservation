let VENUES_DB = [
  {
    id: 101,
    name: "Arena Fit Center",
    city: "Tehran",
    sport: "Football",
    price_per_hour: 450,
    rating: 4.7,
    is_active: true,
    cover_image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
    facilities: ["Indoor", "Parking", "Showers", "Locker"],
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: 102,
    name: "Sky Court",
    city: "Tehran",
    sport: "Basketball",
    price_per_hour: 380,
    rating: 4.5,
    is_active: true,
    cover_image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=60",
    facilities: ["Outdoor"],
    created_at: "2026-02-02T12:00:00Z",
  },
  {
    id: 103,
    name: "Pulse Club",
    city: "Karaj",
    sport: "Volleyball",
    price_per_hour: 320,
    rating: 4.3,
    is_active: false,
    cover_image:
      "https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=1200&q=60",
    facilities: ["Indoor", "Showers"],
    created_at: "2026-02-03T09:10:00Z",
  },
];

const FACILITIES = ["Indoor", "Outdoor", "Parking", "Showers", "Locker", "Cafe", "WC", "AC"];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const wrap = (data, message = "") => ({ status: true, message, data });

export async function fetchFacilitiesMock() {
  await wait(120);
  return wrap({ items: FACILITIES });
}

export async function fetchVenuesMock({ page = 1, page_size = 8, search = "", city = "All", sport = "All", is_active = "All" } = {}) {
  await wait(260);

  const s = (search || "").trim().toLowerCase();

  let items = VENUES_DB.filter((v) => {
    const matchesSearch =
      !s ||
      v.name.toLowerCase().includes(s) ||
      v.city.toLowerCase().includes(s) ||
      v.sport.toLowerCase().includes(s);

    const matchesCity = city === "All" ? true : v.city === city;
    const matchesSport = sport === "All" ? true : v.sport === sport;

    const matchesActive =
      is_active === "All" ? true : (is_active === "true" ? v.is_active === true : v.is_active === false);

    return matchesSearch && matchesCity && matchesSport && matchesActive;
  });

  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / page_size));
  const start = (page - 1) * page_size;
  items = items.slice(start, start + page_size);

  return wrap({ items, page, page_size, total, total_pages });
}

export async function createVenueMock(payload) {
  await wait(260);
  const id = Math.max(...VENUES_DB.map((x) => x.id)) + 1;

  const venue = {
    id,
    name: payload.name,
    city: payload.city,
    sport: payload.sport,
    price_per_hour: Number(payload.price_per_hour || 0),
    rating: payload.rating ? Number(payload.rating) : 0,
    is_active: payload.is_active ?? true,
    cover_image: payload.cover_image || "",
    facilities: payload.facilities || [],
    created_at: new Date().toISOString(),
  };

  VENUES_DB = [venue, ...VENUES_DB];
  return wrap({ venue }, "Venue created.");
}

export async function updateVenueMock(id, payload) {
  await wait(260);
  VENUES_DB = VENUES_DB.map((v) =>
    v.id === id
      ? {
          ...v,
          ...payload,
          price_per_hour: payload.price_per_hour !== undefined ? Number(payload.price_per_hour) : v.price_per_hour,
          rating: payload.rating !== undefined ? Number(payload.rating) : v.rating,
        }
      : v
  );

  const venue = VENUES_DB.find((v) => v.id === id);
  return wrap({ venue }, "Venue updated.");
}

export async function updateVenueFacilitiesMock(id, facilities) {
  await wait(220);
  VENUES_DB = VENUES_DB.map((v) => (v.id === id ? { ...v, facilities: facilities || [] } : v));
  const venue = VENUES_DB.find((v) => v.id === id);
  return wrap({ venue }, "Facilities updated.");
}

export async function deleteVenueMock(id) {
  await wait(220);
  VENUES_DB = VENUES_DB.filter((v) => v.id !== id);
  return wrap({}, "Venue deleted.");
}
