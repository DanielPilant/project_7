import api from "../api/axios.js";

// DB-backed auth. The database is the source of truth for users; localStorage
// only holds the logged-in user object (under "auth_user") so the app knows
// who is logged in and can gate routes. Passwords are never stored client-side.

const SESSION_KEY = "auth_user";

// Register does NOT start a session — the user must log in afterwards.
export async function register(form) {
  const { data } = await api.post("/register", form);
  return data;
}

// Login starts the session: persist the returned user object locally.
export async function login(username, password) {
  const { data } = await api.post("/login", { username, password });
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

// --- admin user management (DB-backed) ---
export async function fetchUsers() {
  const { data } = await api.get("/users");
  return data;
}

export async function makeAdmin(userId) {
  const { data } = await api.patch(`/users/${userId}/role`, { role: "admin" });
  return data;
}

// Self-service: the logged-in user upgrades to creator. Because this changes
// the current user, update the stored session too.
export async function becomeCreator(userId) {
  const { data } = await api.patch(`/users/${userId}/role`, { role: "creator" });
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}
