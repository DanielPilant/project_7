// Minimal localStorage-based auth (no backend yet).
// Users + session live in localStorage; passwords are hashed with the
// browser's built-in Web Crypto (SHA-256 + per-user salt) — no extra deps.

const USERS_KEY = "soundforge_users";
const SESSION_KEY = "soundforge_session";

export const ROLES = ["user", "creator", "admin"];

// --- storage helpers ---
function readUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- password hashing (salted SHA-256) ---
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- public API ---
export function getUsers() {
  return readUsers();
}

export function getCurrentUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readUsers().find((u) => u.id === id) || null;
}

export async function registerUser({ name, email, password, role = "user" }) {
  const users = readUsers();
  if (users.some((u) => u.email === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }

  const salt = crypto.randomUUID();
  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    salt,
    passwordHash: await hashPassword(password, salt),
    role: ROLES.includes(role) ? role : "user",
  };

  users.push(user);
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, user.id); // auto-login after register
  return user;
}

export async function loginUser(email, password) {
  const user = readUsers().find((u) => u.email === email.toLowerCase());
  if (!user) throw new Error("No account with this email.");

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) throw new Error("Wrong password.");

  localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// Admin-only action: promote another user to admin.
export function makeAdmin(userId) {
  const users = readUsers();
  const target = users.find((u) => u.id === userId);
  if (target) {
    target.role = "admin";
    writeUsers(users);
  }
}

// Seed a default admin the first time the app runs, so an admin exists
// to promote others (only an admin can make more admins).
export async function ensureSeedAdmin() {
  const users = readUsers();
  if (users.length > 0) return;

  const salt = crypto.randomUUID();
  users.push({
    id: crypto.randomUUID(),
    name: "Admin",
    email: "admin@soundforge.com",
    salt,
    passwordHash: await hashPassword("admin123", salt),
    role: "admin",
  });
  writeUsers(users);
}
