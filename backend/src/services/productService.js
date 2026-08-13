import * as productModel from "../models/productModel.js";
import { uploadFileToS3, deleteFileFromS3 } from "../services/s3Service.js";
import { AppError } from "../utils/httpError.js";

// Business rules for sound packs: who may change what, what a pack needs before
// it can exist, and keeping S3 in step with the DB.

// A pack can be controlled by its owning creator or by any admin.
const canControl = (product, requester) =>
  requester.role === "admin" ||
  String(product.creator_id) === String(requester.id);

// Throws unless the pack exists and the requester owns it (or is an admin).
const assertControl = async (productId, requester) => {
  const product = await productModel.getProductById(productId);
  if (!product) throw new AppError(404, "Product not found.");
  if (!canControl(product, requester)) {
    throw new AppError(403, "Not allowed — you don't own this pack.");
  }
  return product;
};

// Best-effort S3 cleanup: a broken or missing URL must never block a DB delete.
const removeFiles = async (urls) => {
  for (const url of urls) {
    try {
      await deleteFileFromS3(url);
    } catch (e) {
      console.error("S3 delete failed for", url, "-", e.message);
    }
  }
};

export const getAllProducts = async () => await productModel.getAllProducts();

export const getProductById = async (id) => {
  const product = await productModel.getProductById(id);
  if (!product) throw new AppError(404, "Product not found");
  return product;
};

export const getProductsByCreator = async (creatorId) =>
  await productModel.getProductsByCreator(creatorId);

export const updateProduct = async (id, { title, description, price }, requester) => {
  await assertControl(id, requester);

  if (!title || price === undefined || price === null || price === "") {
    throw new AppError(400, "Title and price are required.");
  }

  await productModel.updateProduct(id, {
    title,
    description: description ?? null,
    price,
  });

  return await productModel.getProductById(id);
};

export const deleteProduct = async (id, requester) => {
  const product = await assertControl(id, requester);

  // Previews first, then the pack's own files.
  const previews = await productModel.getPreviewsForProduct(id);
  await removeFiles([
    ...previews.map((p) => p.demo_audio_url),
    product.zip_file_url,
    product.main_demo_url,
    product.cover_image_url,
  ]);

  await productModel.deleteProduct(id);
  return Number(id);
};

export const getPreviews = async (productId) =>
  await productModel.getPreviewsForProduct(productId);

export const deletePreview = async (previewId, requester) => {
  const preview = await productModel.getPreviewById(previewId);
  if (!preview) throw new AppError(404, "Preview not found.");

  await assertControl(preview.product_id, requester);
  await removeFiles([preview.demo_audio_url]);

  await productModel.deletePreview(previewId);
  return Number(previewId);
};

export const addPreviewSound = async ({ productId, title, file, requester }) => {
  if (!productId || !title) {
    throw new AppError(400, "Missing required fields or files.");
  }
  if (!file) throw new AppError(400, "No file uploaded");

  // Only the pack's owner (or an admin) may add a preview to it.
  await assertControl(productId, requester);

  const s3Url = await uploadFileToS3(file, "preview-sounds");
  const previewId = await productModel.createProductPreview(
    productId,
    title,
    s3Url,
  );

  return { id: previewId, title, url: s3Url };
};

export const addSoundPack = async ({ title, description, price, files, creator }) => {
  if (!title || !price) {
    throw new AppError(400, "Missing required fields or files.");
  }

  const zipFile = files?.zipFile ? files.zipFile[0] : null;
  const mainDemo = files?.mainDemo ? files.mainDemo[0] : null;
  const coverImage = files?.coverImage ? files.coverImage[0] : null;

  if (!zipFile || !mainDemo || !coverImage) {
    throw new AppError(400, "Missing required files (ZIP, Demo or Cover).");
  }

  // The ZIP goes to a private prefix — it is only ever handed out as a signed
  // link after a purchase. The demo and cover are public.
  const zipFileUrl = await uploadFileToS3(zipFile, "private/packs");
  const mainDemoUrl = await uploadFileToS3(mainDemo, "public/audio/demos");
  const coverImageUrl = await uploadFileToS3(coverImage, "public/images/covers");

  const productId = await productModel.createProductFile(
    creator.id,
    creator.name || null,
    title,
    description,
    price,
    coverImageUrl,
    mainDemoUrl,
    zipFileUrl,
  );

  return {
    productId,
    files: { zipFileUrl, mainDemoUrl, coverImageUrl },
  };
};
