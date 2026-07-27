import db from "../config/db.js";

export const getAllProducts = async () => {
  const query = `
    SELECT id, creator_id, creator_name, title, description, price, cover_image_url, main_demo_url, created_at
    FROM Products ORDER BY created_at DESC
    `;

  const [rows] = await db.execute(query);

  return rows;
};

export const getProductById = async (id) => {
  // Alias main_demo_url as demo_audio_url — the details page expects that name.
  const query = `
    SELECT *, main_demo_url AS demo_audio_url FROM Products WHERE id = ?
    `;

  const [rows] = await db.execute(query, [id]);

  return rows[0] || null;
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
