import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  getProducts,
  getProductById,
  addPreviewSound,
  addSoundPack,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
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
