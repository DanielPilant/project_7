import express from "express";
import {
  register,
  login,
  listUsers,
  updateUserRole,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Admin user management (client-side role check for now; JWT guard comes later).
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
