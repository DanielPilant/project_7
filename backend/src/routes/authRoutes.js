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

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Admin user management (client-side role check for now; JWT guard comes later).
router.get("/users", listUsers);
router.get("/users/:id/activity", getUserActivity);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// All comments across the site (admin content panel).
router.get("/comments", getAllComments);

export default router;
