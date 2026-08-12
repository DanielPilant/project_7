import db from "../config/db.js";

// NOTE: the pool is size 1 (DB_CONNECTION_LIMIT=1), run queries sequentially,
// never Promise.all, or a query will wait for a connection that never frees.

// --- likes ---
export const likeProduct = async (userId, productId) => {
  await db.execute(
    "INSERT IGNORE INTO product_likes (user_id, product_id) VALUES (?, ?)",
    [userId, productId],
  );
};

export const unlikeProduct = async (userId, productId) => {
  await db.execute(
    "DELETE FROM product_likes WHERE user_id = ? AND product_id = ?",
    [userId, productId],
  );
};

// { count, liked } — liked is whether the given user has liked this pack.
export const getLikeInfo = async (productId, userId) => {
  const [[countRow]] = await db.execute(
    "SELECT COUNT(*) AS count FROM product_likes WHERE product_id = ?",
    [productId],
  );

  let liked = false;
  if (userId) {
    const [rows] = await db.execute(
      "SELECT 1 FROM product_likes WHERE product_id = ? AND user_id = ?",
      [productId, userId],
    );
    liked = rows.length > 0;
  }

  return { count: countRow.count, liked };
};

// --- comments ---
export const addComment = async (userId, productId, comment) => {
  const [result] = await db.execute(
    "INSERT INTO product_comments (user_id, product_id, comment) VALUES (?, ?, ?)",
    [userId, productId, comment],
  );
  return result.insertId;
};

export const getCommentsForProduct = async (productId) => {
  const [rows] = await db.execute(
    `SELECT c.id, c.comment, c.created_at, c.user_id, u.name, u.username
     FROM product_comments c JOIN users u ON u.id = c.user_id
     WHERE c.product_id = ?
     ORDER BY c.created_at DESC`,
    [productId],
  );
  return rows;
};

export const getCommentById = async (commentId) => {
  const [rows] = await db.execute(
    "SELECT * FROM product_comments WHERE id = ?",
    [commentId],
  );
  return rows[0] || null;
};

export const deleteComment = async (commentId) => {
  await db.execute("DELETE FROM product_comments WHERE id = ?", [commentId]);
};

// --- a user's own activity (for the profile "Actions" section) ---
export const getUserLikes = async (userId) => {
  const [rows] = await db.execute(
    `SELECT p.id, p.title, p.creator_name, p.cover_image_url, l.created_at AS liked_at
     FROM product_likes l JOIN Products p ON p.id = l.product_id
     WHERE l.user_id = ?
     ORDER BY l.created_at DESC`,
    [userId],
  );
  return rows;
};

export const getUserComments = async (userId) => {
  const [rows] = await db.execute(
    `SELECT c.id, c.comment, c.created_at, c.product_id, p.title AS product_title
     FROM product_comments c JOIN Products p ON p.id = c.product_id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId],
  );
  return rows;
};

// --- all comments (admin content panel) ---
export const getAllComments = async () => {
  const [rows] = await db.execute(
    `SELECT c.id, c.comment, c.created_at, c.user_id, u.username,
            c.product_id, p.title AS product_title
     FROM product_comments c
     JOIN users u ON u.id = c.user_id
     JOIN Products p ON p.id = c.product_id
     ORDER BY c.created_at DESC`,
  );
  return rows;
};
