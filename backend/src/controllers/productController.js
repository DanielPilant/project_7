import { uploadFileToS3, deleteFileFromS3 } from "../services/s3Service.js";
import * as productModel from "../models/productModel.js";

// A pack can be controlled by its owning creator or by any admin.
const canControl = (product, requesterId, requesterRole) =>
  requesterRole === "admin" ||
  String(product.creator_id) === String(requesterId);

export const getProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const getProductsByCreator = async (req, res) => {
  try {
    const products = await productModel.getProductsByCreator(
      req.params.creatorId,
    );
    res.json(products);
  } catch (error) {
    console.error("Error fetching creator products:", error);
    res.status(500).json({ error: "Failed to fetch creator products" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const product = await productModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (!canControl(product, requesterId, requesterRole)) {
      return res
        .status(403)
        .json({ error: "Not allowed — you don't own this pack." });
    }

    if (!title || price === undefined || price === null || price === "") {
      return res.status(400).json({ error: "Title and price are required." });
    }

    await productModel.updateProduct(req.params.id, {
      title,
      description: description ?? null,
      price,
    });

    const updated = await productModel.getProductById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const product = await productModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (!canControl(product, requesterId, requesterRole)) {
      return res
        .status(403)
        .json({ error: "Not allowed — you don't own this pack." });
    }

    // Best-effort S3 cleanup: preview files first, then the pack's own files.
    // A broken/missing URL must not block the DB delete.
    const previews = await productModel.getPreviewsForProduct(req.params.id);
    const urls = [
      ...previews.map((p) => p.demo_audio_url),
      product.zip_file_url,
      product.main_demo_url,
      product.cover_image_url,
    ];
    for (const url of urls) {
      try {
        await deleteFileFromS3(url);
      } catch (e) {
        console.error("S3 delete failed for", url, "-", e.message);
      }
    }

    await productModel.deleteProduct(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
};

export const getPreviews = async (req, res) => {
  try {
    const previews = await productModel.getPreviewsForProduct(req.params.id);
    res.json(previews);
  } catch (error) {
    console.error("Error fetching previews:", error);
    res.status(500).json({ error: "Failed to fetch previews." });
  }
};

export const deletePreview = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const preview = await productModel.getPreviewById(req.params.previewId);
    if (!preview) return res.status(404).json({ error: "Preview not found." });

    const product = await productModel.getProductById(preview.product_id);
    if (!canControl(product, requesterId, requesterRole)) {
      return res
        .status(403)
        .json({ error: "Not allowed — you don't own this pack." });
    }

    try {
      await deleteFileFromS3(preview.demo_audio_url);
    } catch (e) {
      console.error("S3 delete failed for", preview.demo_audio_url, "-", e.message);
    }

    await productModel.deletePreview(req.params.previewId);
    res.json({ success: true, id: Number(req.params.previewId) });
  } catch (error) {
    console.error("Error deleting preview:", error);
    res.status(500).json({ error: "Failed to delete preview." });
  }
};

export const addPreviewSound = async (req, res) => {
  try {
    const { productId, title } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    const file = req.file;

    if (!productId || !title) {
      return res
        .status(400)
        .json({ error: "Missing required fields or files." });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Only the pack's owner (or an admin) may add a preview to it.
    const product = await productModel.getProductById(productId);
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (!canControl(product, requesterId, requesterRole)) {
      return res
        .status(403)
        .json({ error: "Not allowed — you don't own this pack." });
    }

    const s3Url = await uploadFileToS3(file, "preview-sounds");

    const previewId = await productModel.createProductPreview(
      productId,
      title,
      s3Url,
    );

    res.status(201).json({
      success: true,
      message: "Preview sound uploaded successfully",
      preview: {
        id: previewId,
        title: title,
        url: s3Url,
      },
    });
  } catch (error) {
    console.error("Error uploading preview sound:", error);
    res.status(500).json({ error: "Failed to upload preview sound" });
  }
};

export const addSoundPack = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const creatorId = req.user.id;
    const creatorName = req.user.name || req.user.username;

    const files = req.files;

    if (!title || !price) {
      return res
        .status(400)
        .json({ error: "Missing required fields or files." });
    }

    const zipFile = files?.zipFile ? files.zipFile[0] : null;
    const mainDemo = files?.mainDemo ? files.mainDemo[0] : null;
    const coverImage = files?.coverImage ? files.coverImage[0] : null;

    if (!zipFile || !mainDemo || !coverImage) {
      return res
        .status(400)
        .json({ error: "Missing required files (ZIP, Demo or Cover)." });
    }

    const zipFileUrl = await uploadFileToS3(zipFile, "private/packs");
    const mainDemoUrl = await uploadFileToS3(mainDemo, "public/audio/demos");
    const coverImageUrl = await uploadFileToS3(
      coverImage,
      "public/images/covers",
    );

    const soundPackId = await productModel.createProductFile(
      creatorId,
      creatorName || null,
      title,
      description,
      price,
      coverImageUrl,
      mainDemoUrl,
      zipFileUrl,
    );

    res.status(201).json({
      success: true,
      message: "Sound pack created successfully",
      productId: soundPackId,
      files: {
        zipFileUrl,
        mainDemoUrl,
        coverImageUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading sound pack:", error);
    res
      .status(500)
      .json({ error: "Failed to upload sound pack (productController.js)" });
  }
};
