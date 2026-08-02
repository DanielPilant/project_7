import express from "express";
import upload from "../middleware/uploadMiddleware.js";
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
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Likes + comments (any logged-in user)
router.post("/:id/like", likeProduct);
router.delete("/:id/like", unlikeProduct);
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);
router.delete("/comments/:commentId", deleteComment);

// Previews: list for a pack, delete one (owner/admin)
router.get("/:id/previews", getPreviews);
router.delete("/previews/:previewId", deletePreview);
router.post("/sound-preview", upload.single("sound"), addPreviewSound);
router.post(
  "/sound-pack",
  upload.fields([
    { name: "zipFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "mainDemo", maxCount: 1 },
  ]),
  addSoundPack,
);

export default router;
