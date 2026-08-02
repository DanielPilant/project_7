import db from "../config/db.js";

export const getAllProducts = async () => {
  const query = `
    SELECT p.id, p.creator_id, p.creator_name, p.title, p.description, p.price,
           p.cover_image_url, p.main_demo_url, p.created_at,
           (SELECT COUNT(*) FROM product_likes pl WHERE pl.product_id = p.id) AS like_count,
           (SELECT COUNT(*) FROM product_comments pc WHERE pc.product_id = p.id) AS comment_count
    FROM Products p
    ORDER BY p.created_at DESC
    `;

  const [rows] = await db.execute(query);

  return rows;
};

export const getProductById = async (id) => {
  // Alias main_demo_url as demo_audio_url — the details page expects that name.
  const query = `
    SELECT p.*, p.main_demo_url AS demo_audio_url,
           (SELECT COUNT(*) FROM product_likes pl WHERE pl.product_id = p.id) AS like_count,
           (SELECT COUNT(*) FROM product_comments pc WHERE pc.product_id = p.id) AS comment_count
    FROM Products p
    WHERE p.id = ?
    `;

  const [rows] = await db.execute(query, [id]);

  return rows[0] || null;
};

export const getProductsByCreator = async (creatorId) => {
  const query = `
    SELECT p.id, p.creator_id, p.creator_name, p.title, p.description, p.price,
           p.cover_image_url, p.main_demo_url, p.created_at,
           (SELECT COUNT(*) FROM product_likes pl WHERE pl.product_id = p.id) AS like_count,
           (SELECT COUNT(*) FROM product_comments pc WHERE pc.product_id = p.id) AS comment_count
    FROM Products p
    WHERE p.creator_id = ?
    ORDER BY p.created_at DESC
    `;

  const [rows] = await db.execute(query, [creatorId]);

  return rows;
};

export const updateProduct = async (id, { title, description, price }) => {
  await db.execute(
    "UPDATE Products SET title = ?, description = ?, price = ? WHERE id = ?",
    [title, description, price, id],
  );
};

export const deleteProduct = async (id) => {
  // FK cascade removes this pack's previews, likes and comments too.
  await db.execute("DELETE FROM Products WHERE id = ?", [id]);
};

export const getPreviewsForProduct = async (productId) => {
  const [rows] = await db.execute(
    `SELECT id, product_id, title, demo_audio_url, created_at
     FROM Product_Previews WHERE product_id = ? ORDER BY created_at DESC`,
    [productId],
  );
  return rows;
};

export const getPreviewById = async (previewId) => {
  const [rows] = await db.execute(
    "SELECT * FROM Product_Previews WHERE id = ?",
    [previewId],
  );
  return rows[0] || null;
};

export const deletePreview = async (previewId) => {
  await db.execute("DELETE FROM Product_Previews WHERE id = ?", [previewId]);
};

export const createProductPreview = async (productId, title, s3Url) => {
  const query = `
    INSERT INTO Product_Previews (product_id, title, demo_audio_url) VALUES (?, ?, ?)
    `;

  const [result] = await db.execute(query, [productId, title, s3Url]);

  return result.insertId;
};

export const createProductFile = async (
  creatorId,
  creatorName,
  title,
  description,
  price,
  cover_image_url,
  main_demo_url,
  zip_file_url,
) => {
  const query = `
    INSERT INTO Products (creator_id, creator_name, title, description, price, cover_image_url, main_demo_url, zip_file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await db.execute(query, [
    creatorId,
    creatorName,
    title,
    description,
    price,
    cover_image_url,
    main_demo_url,
    zip_file_url,
  ]);

  return result.insertId;
};
