import * as authService from "../services/authService.js";
import { respondWithError } from "../utils/httpError.js";

// HTTP only: read the request, call the service, shape the response.
// Account rules live in services/authService.js, SQL in models/authModel.js.

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    respondWithError(res, error, "Error registering user:", "Failed to register.");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const session = await authService.login(username, password);
    res.json(session);
  } catch (error) {
    respondWithError(res, error, "Error logging in:", "Failed to log in.");
  }
};

// --- admin user management ---
export const listUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (error) {
    respondWithError(res, error, "Error listing users:", "Failed to list users.");
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await authService.setUserRole(req.params.id, req.body.role);
    res.json(user);
  } catch (error) {
    respondWithError(res, error, "Error updating role:", "Failed to update role.");
  }
};

export const becomeCreator = async (req, res) => {
  try {
    const session = await authService.becomeCreator(req.user.id);
    res.json(session);
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error upgrading to creator:",
      "Failed to become a creator.",
    );
  }
};

export const deleteUser = async (req, res) => {
  try {
    await authService.deleteUser(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (error) {
    respondWithError(res, error, "Error deleting user:", "Failed to delete user.");
  }
};
