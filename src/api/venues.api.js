// src/api/venues.api.js

const MOCK_VENUES = [
  {
    id: 1,
    name: "Arena Fit Center",
    city: "Tehran",
    sport: "Football",
    pricePerHour: 450,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
    tags: ["Indoor", "Parking"],
  },
  {
    id: 2,
    name: "Sky Court",
    city: "Tehran",
    sport: "Basketball",
    pricePerHour: 380,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=60",
    tags: ["Outdoor"],
  },
  {
    id: 3,
    name: "Pulse Club",
    city: "Karaj",
    sport: "Volleyball",
    pricePerHour: 320,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=1200&q=60",
    tags: ["Indoor", "Showers"],
  },

  // دیتا بیشتر برای pagination
  ...Array.from({ length: 30 }).map((_, i) => ({
    id: 10 + i,
    name: `Venue ${i + 4}`,
    city: i % 2 === 0 ? "Tehran" : "Karaj",
    sport: ["Football", "Basketball", "Volleyball"][i % 3],
    pricePerHour: 250 + i * 10,
    rating: Number(4 + (i % 10) * 0.05).toFixed(1),
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=60",
    tags: i % 2 === 0 ? ["Indoor"] : ["Outdoor"],
  })),
];

export async function fetchVenuesMock({
  page = 1,
  page_size = 6,
  search = "",
  sport = "All",
}) {
  // شبیه‌سازی latency شبکه
  await new Promise((r) => setTimeout(r, 400));

  let filtered = [...MOCK_VENUES];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
    );
  }

  if (sport !== "All") {
    filtered = filtered.filter((v) => v.sport === sport);
  }

  const total = filtered.length;
  const start = (page - 1) * page_size;
  const end = start + page_size;
  const items = filtered.slice(start, end);

  return {
    status: true,
    message: "",
    data: {
      results: items,        // مثل DRF
      total: total,
      page: page,
      page_size: page_size,
    },
  };
}
