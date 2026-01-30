// Mock in-memory DB
let USERS_DB = [
  { id: 1, name: "Erfan", email: "erfan@example.com", role: "admin", is_active: true, created_at: "2026-01-10" },
  { id: 2, name: "Sara", email: "sara@example.com", role: "user", is_active: true, created_at: "2026-01-11" },
  { id: 3, name: "Ali", email: "ali@example.com", role: "venue_manager", is_active: false, created_at: "2026-01-14" },
  { id: 4, name: "Mina", email: "mina@example.com", role: "user", is_active: true, created_at: "2026-01-20" },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function wrap(data, message = "") {
  return { status: true, message, data };
}

export async function fetchUsersMock({ page = 1, page_size = 8, search = "", role = "All" } = {}) {
  await wait(250);

  const s = (search || "").trim().toLowerCase();

  let items = USERS_DB.filter((u) => {
    const matchesSearch =
      !s ||
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s);

    const matchesRole = role === "All" ? true : u.role === role;

    return matchesSearch && matchesRole;
  });

  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / page_size));
  const start = (page - 1) * page_size;
  items = items.slice(start, start + page_size);

  return wrap({ items, total, total_pages, page, page_size });
}

export async function createUserMock(payload) {
  await wait(250);
  const id = Math.max(...USERS_DB.map((x) => x.id)) + 1;

  const user = {
    id,
    name: payload.name,
    email: payload.email,
    role: payload.role || "user",
    is_active: payload.is_active ?? true,
    created_at: new Date().toISOString().slice(0, 10),
  };

  USERS_DB = [user, ...USERS_DB];
  return wrap({ user }, "User created.");
}

export async function updateUserMock(id, payload) {
  await wait(250);
  USERS_DB = USERS_DB.map((u) => (u.id === id ? { ...u, ...payload } : u));
  const user = USERS_DB.find((u) => u.id === id);
  return wrap({ user }, "User updated.");
}

export async function deleteUserMock(id) {
  await wait(250);
  USERS_DB = USERS_DB.filter((u) => u.id !== id);
  return wrap({}, "User deleted.");
}
