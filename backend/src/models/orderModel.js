import db from "../config/db.js";

// Create an order + its line items in a single transaction.
// `items` is an array of { productId, price } objects.
export const createOrder = async (userId, totalAmount, items) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.execute(
      `INSERT INTO Orders (user_id, total_amount, payment_status)
       VALUES (?, ?, 'completed')`,
      [userId, totalAmount],
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.execute(
        `INSERT INTO Order_Items (order_id, product_id, price_at_purchase)
         VALUES (?, ?, ?)`,
        [orderId, item.productId, item.price],
      );
    }

    await conn.commit();
    return orderId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// Fetch all orders for a user, including the products in each order.
export const getOrdersByUser = async (userId) => {
  const [orders] = await db.execute(
    `SELECT o.id, o.total_amount, o.payment_status, o.created_at
     FROM Orders o
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [userId],
  );

  for (const order of orders) {
    const [items] = await db.execute(
      `SELECT oi.product_id, oi.price_at_purchase,
              p.title, p.cover_image_url, p.zip_file_url, p.creator_name
       FROM Order_Items oi
       JOIN Products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [order.id],
    );
    order.items = items;
  }

  return orders;
};

// Check if a user has purchased a specific product (for download gating).
export const hasUserPurchasedProduct = async (userId, productId) => {
  const [rows] = await db.execute(
    `SELECT 1
     FROM Order_Items oi
     JOIN Orders o ON o.id = oi.order_id
     WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'completed'
     LIMIT 1`,
    [userId, productId],
  );
  return rows.length > 0;
};

// Fetch current prices for a list of product IDs (for cart validation).
export const getProductPrices = async (productIds) => {
  if (!productIds.length) return [];
  const placeholders = productIds.map(() => "?").join(",");
  const [rows] = await db.execute(
    `SELECT id, title, price FROM Products WHERE id IN (${placeholders})`,
    productIds,
  );
  return rows;
};
