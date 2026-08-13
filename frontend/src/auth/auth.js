import api from "../api/axios.js";

// DB-backed auth. The database is the source of truth for users; localStorage
// holds the logged-in user object and JWT token.

const SESSION_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

// Register does NOT start a session — the user must log in afterwards.
export async function register(form) {
  const { data } = await api.post("/register", form);
  return data;
}

// Login starts the session: persist the returned user object and token locally.
export async function login(username, password) {
  const { data } = await api.post("/login", { username, password });
  // data now contains { token, user }
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
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

// Self-service: the logged-in user upgrades to creator. The server identifies
// them from the token, so no id is sent. It replies like login ({ token, user })
// because the role lives inside the JWT — storing only the user would leave the
// server still seeing a customer until the next login.
export async function becomeCreator() {
  const { data } = await api.post("/users/me/become-creator");
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

// Admin: set any user's role, or delete a user entirely.
export async function setUserRole(userId, role) {
  const { data } = await api.patch(`/users/${userId}/role`, { role });
  return data;
}

export async function deleteUser(userId) {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
}
