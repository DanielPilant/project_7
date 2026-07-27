import { uploadFileToS3 } from "../services/s3Service.js";
import * as productModel from "../models/productModel.js";

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

export const addPreviewSound = async (req, res) => {
  try {
    const { productId, title } = req.body;
    const file = req.file;

    if (!productId || !title) {
      return res
        .status(400)
        .json({ error: "Missing required fields or files." });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
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
    const { creatorId, creatorName, title, description, price } = req.body;

    const files = req.files;

    if (!creatorId || !title || !price) {
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
