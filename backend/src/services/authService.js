import jwt from "jsonwebtoken";
import * as authModel from "../models/authModel.js";
import { AppError } from "../utils/httpError.js";

// Business rules for accounts: which roles exist, who may become what, and the
// failed-login lockout. All SQL lives in models/authModel.js.

const JWT_SECRET = process.env.JWT_SECRET || "default_development_secret_key";

const ROLES = ["admin", "creator", "customer"];
export const MAX_FAILED_ATTEMPTS = 10;

// The role travels inside the token, so every route that changes the caller's
// own role has to re-issue one — otherwise requireRole keeps reading the old value.
const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

// Register. Admin can never be self-assigned here; only 'creator' or 'customer'
// are accepted no matter what the client sends.
export const registerUser = async (payload) => {
  const { name, username, email, password } = payload;

  if (!name || !username || !email || !password) {
    throw new AppError(
      400,
      "Name, username, email and password are required.",
    );
  }

  const safeRole = payload.role === "creator" ? "creator" : "customer";

  try {
    return await authModel.createUser({ ...payload, role: safeRole });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new AppError(409, "That username or email is already taken.");
    }
    throw error;
  }
};

// Login, in four deliberate steps: resolve the account without testing the
// password, refuse it if already blocked, then check the password, then clear
// the counter. Unknown usernames get the same generic error as wrong passwords
// so we don't reveal which accounts exist.
export const login = async (username, password) => {
  if (!username || !password) {
    throw new AppError(400, "Username and password are required.");
  }

  const auth = await authModel.findAuthByUsername(username);
  if (!auth) {
    throw new AppError(401, "Invalid username or password.");
  }

  if (auth.failed_attempts >= MAX_FAILED_ATTEMPTS) {
    throw new AppError(403, "Account blocked after too many attempts.");
  }

  const user = await authModel.findUserByCredentials(username, password);
  if (!user) {
    const attempts = await authModel.registerFailedAttempt(
      auth.user_id,
      MAX_FAILED_ATTEMPTS,
    );
    const remaining = MAX_FAILED_ATTEMPTS - attempts;
    if (remaining <= 0) {
      throw new AppError(403, "Account blocked after too many attempts.");
    }
    throw new AppError(
      401,
      `Invalid username or password. ${remaining} attempt(s) remaining.`,
    );
  }

  await authModel.resetFailedAttempts(auth.user_id);

  return { token: signToken(user), user };
};

// --- admin user management ---
export const getAllUsers = async () => await authModel.getAllUsers();

export const setUserRole = async (userId, role) => {
  if (!ROLES.includes(role)) throw new AppError(400, "Invalid role");

  await authModel.updateUserRole(userId, role);

  const user = await authModel.getPublicUserById(userId);
  if (!user) throw new AppError(404, "User not found.");
  return user;
};

// Self-service upgrade. Safe without requireRole because it acts on the id from
// the verified token (never a param), only ever grants 'creator', and refuses
// any role other than 'customer' — so it can't escalate to admin or demote one.
// Returns a fresh token because the role lives inside the JWT.
export const becomeCreator = async (userId) => {
  // The role in a JWT is a snapshot from login time, so read it back from the
  // DB instead of trusting the token.
  const current = await authModel.getPublicUserById(userId);
  if (!current) throw new AppError(404, "User not found.");

  if (current.role !== "customer") {
    throw new AppError(409, `A ${current.role} cannot upgrade to creator.`);
  }

  const user = await setUserRole(userId, "creator");
  return { token: signToken(user), user };
};

export const deleteUser = async (userId) => {
  await authModel.deleteUser(userId);
};
