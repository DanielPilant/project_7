import * as authService from "../services/authService.js";
import { MAX_FAILED_ATTEMPTS } from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, username, email and password are required." });
    }

    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "That username or email is already taken." });
    }
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    // 1. Lockout lookup (no password check yet). Generic error for unknown
    //    usernames so we don't reveal which accounts exist.
    const auth = await authService.findAuthByUsername(username);
    if (!auth) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // 2. Blocked before we even test the password.
    if (auth.failed_attempts >= MAX_FAILED_ATTEMPTS) {
      return res
        .status(403)
        .json({ error: "Account blocked after too many attempts." });
    }

    // 3. The real password check (comparison done inside SQL).
    const user = await authService.findUserByCredentials(username, password);
    if (!user) {
      const attempts = await authService.registerFailedAttempt(auth.user_id);
      const remaining = MAX_FAILED_ATTEMPTS - attempts;
      if (remaining <= 0) {
        return res
          .status(403)
          .json({ error: "Account blocked after too many attempts." });
      }
      return res.status(401).json({
        error: `Invalid username or password. ${remaining} attempt(s) remaining.`,
      });
    }

    // 4. Success: clear the counter/lock, record last_login_at.
    await authService.resetFailedAttempts(auth.user_id);
    res.json(user);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to log in." });
  }
};

// --- admin user management ---
export const listUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Failed to list users." });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await authService.setUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(400).json({ error: error.message || "Failed to update role." });
  }
};
