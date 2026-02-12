let BOOKINGS_DB = [
  {
    id: 9001,
    status: "pending",
    created_at: "2026-02-10T11:00:00Z",
    user: { id: 12, name: "Ali", email: "ali@mail.com" },
    venue: { id: 101, name: "Arena Fit Center", city: "Tehran", sport: "Football" },
    date: "2026-02-12",
    start_time: "18:00",
    hours: 2,
    price_total: 900,
    cancel_reason: null,
    confirmed_at: null,
  },
  {
    id: 9002,
    status: "confirmed",
    created_at: "2026-02-09T09:30:00Z",
    user: { id: 17, name: "Sara", email: "sara@mail.com" },
    venue: { id: 102, name: "Sky Court", city: "Tehran", sport: "Basketball" },
    date: "2026-02-11",
    start_time: "16:00",
    hours: 1,
    price_total: 380,
    cancel_reason: null,
    confirmed_at: "2026-02-09T10:00:00Z",
  },
  {
    id: 9003,
    status: "canceled",
    created_at: "2026-02-08T14:10:00Z",
    user: { id: 22, name: "Reza", email: "reza@mail.com" },
    venue: { id: 103, name: "Pulse Club", city: "Karaj", sport: "Volleyball" },
    date: "2026-02-10",
    start_time: "20:00",
    hours: 3,
    price_total: 960,
    cancel_reason: "User requested cancellation.",
    confirmed_at: null,
  },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const wrap = (data, message = "") => ({ status: true, message, data });

function inRange(dateStr, from, to) {
  if (!from && !to) return true;
  const d = new Date(dateStr + "T00:00:00");
  if (from) {
    const f = new Date(from + "T00:00:00");
    if (d < f) return false;
  }
  if (to) {
    const t = new Date(to + "T00:00:00");
    if (d > t) return false;
  }
  return true;
}

export async function fetchBookingsMock({
  page = 1,
  page_size = 10,
  search = "",
  status = "All",
  from = "",
  to = "",
} = {}) {
  await wait(260);

  const s = (search || "").trim().toLowerCase();

  let items = BOOKINGS_DB.filter((b) => {
    const matchesSearch =
      !s ||
      b.user.name.toLowerCase().includes(s) ||
      b.user.email.toLowerCase().includes(s) ||
      b.venue.name.toLowerCase().includes(s) ||
      b.venue.city.toLowerCase().includes(s) ||
      b.venue.sport.toLowerCase().includes(s);

    const matchesStatus = status === "All" ? true : b.status === status;
    const matchesDate = inRange(b.date, from, to);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // sort: newest created_at first
  items.sort((a, c) => new Date(c.created_at) - new Date(a.created_at));

  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / page_size));
  const start = (page - 1) * page_size;
  items = items.slice(start, start + page_size);

  return wrap({ items, page, page_size, total, total_pages });
}

export async function confirmBookingMock(id) {
  await wait(220);
  BOOKINGS_DB = BOOKINGS_DB.map((b) =>
    b.id === id
      ? { ...b, status: "confirmed", confirmed_at: new Date().toISOString(), cancel_reason: null }
      : b
  );
  const booking = BOOKINGS_DB.find((b) => b.id === id);
  return wrap({ booking }, "Booking confirmed.");
}

export async function cancelBookingMock(id, reason) {
  await wait(220);
  BOOKINGS_DB = BOOKINGS_DB.map((b) =>
    b.id === id
      ? { ...b, status: "canceled", cancel_reason: reason || "Canceled by admin.", confirmed_at: null }
      : b
  );
  const booking = BOOKINGS_DB.find((b) => b.id === id);
  return wrap({ booking }, "Booking canceled.");
}
