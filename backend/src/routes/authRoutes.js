import express from "express";
import {
  register,
  login,
  listUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/authController.js";
import {
  getUserActivity,
  getAllComments,
} from "../controllers/interactionController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Admin user management.
router.get("/users", authenticateToken, requireRole("admin"), listUsers);
router.get("/users/:id/activity", authenticateToken, getUserActivity);
router.patch("/users/:id/role", authenticateToken, requireRole("admin"), updateUserRole);
router.delete("/users/:id", authenticateToken, requireRole("admin"), deleteUser);

// All comments across the site (admin content panel).
router.get("/comments", authenticateToken, requireRole("admin"), getAllComments);

export default router;
