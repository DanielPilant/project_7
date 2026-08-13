import * as productService from "../services/productService.js";
import { respondWithError } from "../utils/httpError.js";

// HTTP only. Ownership checks, validation and S3 work live in
// services/productService.js; SQL lives in models/productModel.js.

// Everything the service needs to decide whether the caller may act on a pack.
const requesterOf = (req) => ({ id: req.user.id, role: req.user.role });

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    respondWithError(res, error, "Error fetching products:", "Failed to fetch products");
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    respondWithError(res, error, "Error fetching product:", "Failed to fetch product");
  }
};

export const getProductsByCreator = async (req, res) => {
  try {
    const products = await productService.getProductsByCreator(req.params.creatorId);
    res.json(products);
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error fetching creator products:",
      "Failed to fetch creator products",
    );
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await productService.updateProduct(
      req.params.id,
      req.body,
      requesterOf(req),
    );
    res.json(updated);
  } catch (error) {
    respondWithError(res, error, "Error updating product:", "Failed to update product.");
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = await productService.deleteProduct(req.params.id, requesterOf(req));
    res.json({ success: true, id });
  } catch (error) {
    respondWithError(res, error, "Error deleting product:", "Failed to delete product.");
  }
};

export const getPreviews = async (req, res) => {
  try {
    const previews = await productService.getPreviews(req.params.id);
    res.json(previews);
  } catch (error) {
    respondWithError(res, error, "Error fetching previews:", "Failed to fetch previews.");
  }
};

export const deletePreview = async (req, res) => {
  try {
    const id = await productService.deletePreview(
      req.params.previewId,
      requesterOf(req),
    );
    res.json({ success: true, id });
  } catch (error) {
    respondWithError(res, error, "Error deleting preview:", "Failed to delete preview.");
  }
};

export const addPreviewSound = async (req, res) => {
  try {
    const preview = await productService.addPreviewSound({
      productId: req.body.productId,
      title: req.body.title,
      file: req.file,
      requester: requesterOf(req),
    });

    res.status(201).json({
      success: true,
      message: "Preview sound uploaded successfully",
      preview,
    });
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error uploading preview sound:",
      "Failed to upload preview sound",
    );
  }
};

export const addSoundPack = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const { productId, files } = await productService.addSoundPack({
      title,
      description,
      price,
      files: req.files,
      creator: { id: req.user.id, name: req.user.name || req.user.username },
    });

    res.status(201).json({
      success: true,
      message: "Sound pack created successfully",
      productId,
      files,
    });
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error uploading sound pack:",
      "Failed to upload sound pack.",
    );
  }
};
