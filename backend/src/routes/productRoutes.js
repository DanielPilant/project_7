import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getProducts,
  getProductById,
  getProductsByCreator,
  updateProduct,
  deleteProduct,
  getPreviews,
  deletePreview,
  addPreviewSound,
  addSoundPack,
} from "../controllers/productController.js";
import {
  likeProduct,
  unlikeProduct,
  getComments,
  addComment,
  deleteComment,
} from "../controllers/interactionController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/creator/:creatorId", getProductsByCreator);
router.get("/:id", getProductById);

// Pack CRUD (owner creator or admin)
router.patch("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

// Likes + comments (any logged-in user)
router.post("/:id/like", authenticateToken, likeProduct);
router.delete("/:id/like", authenticateToken, unlikeProduct);
router.get("/:id/comments", getComments); // viewing comments is public
router.post("/:id/comments", authenticateToken, addComment);
router.delete("/comments/:commentId", authenticateToken, deleteComment);

// Previews: list for a pack, delete one (owner/admin)
router.get("/:id/previews", getPreviews);
router.delete("/previews/:previewId", authenticateToken, deletePreview);
router.post("/sound-preview", authenticateToken, upload.single("sound"), addPreviewSound);
router.post(
  "/sound-pack",
  authenticateToken,
  upload.fields([
    { name: "zipFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "mainDemo", maxCount: 1 },
  ]),
  addSoundPack,
);

export default router;
