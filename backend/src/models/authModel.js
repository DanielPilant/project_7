import pool from "../config/db.js";

// SQL for users + user_auth. Passwords are hashed inside MySQL with SHA2(?, 256)
// and live in the separate user_auth table, so the public users table never
// holds a password — this model is the only place that knows that layout.
//
// No business rules here: which roles are legal, when an account is blocked and
// who may change what all live in services/authService.js.

export const PUBLIC_FIELDS =
  "id, name, username, email, phone, website, role, created_at";

// executor is the pool by default, or a specific connection when called from
// inside a transaction — never acquire a 2nd connection while holding one
// (the pool can be as small as 1), or it deadlocks.
export const getPublicUserById = async (id, executor = pool) => {
  const [rows] = await executor.execute(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`,
    [id],
  );
  return rows[0] || null;
};

// Insert profile + auth row in one transaction. `role` is already validated by
// the service — the model stores what it is handed.
export const createUser = async ({
  name,
  username,
  email,
  password,
  phone,
  website,
  role,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO users (name, username, email, phone, website, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, username, email, phone || null, website || null, role],
    );
    const userId = result.insertId;

    await conn.execute(
      `INSERT INTO user_auth (user_id, password_hash)
       VALUES (?, SHA2(?, 256))`,
      [userId, password],
    );

    await conn.commit();
    return await getPublicUserById(userId, conn);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// Resolves a username to its auth row WITHOUT checking the password, so the
// service can enforce the block before comparing.
export const findAuthByUsername = async (username) => {
  const [rows] = await pool.execute(
    `SELECT a.user_id, a.failed_attempts
     FROM user_auth a JOIN users u ON u.id = a.user_id
     WHERE u.username = ?`,
    [username],
  );
  return rows[0] || null;
};

// The actual password check: the comparison happens inside SQL.
export const findUserByCredentials = async (username, password) => {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS.split(", ")
      .map((f) => `u.${f}`)
      .join(", ")}
     FROM users u JOIN user_auth a ON a.user_id = u.id
     WHERE u.username = ? AND a.password_hash = SHA2(?, 256)`,
    [username, password],
  );
  return rows[0] || null;
};

// Increment the failed counter; stamp blocked_at on the attempt that hits the
// limit. The limit is passed in by the service. Returns the new count.
export const registerFailedAttempt = async (userId, maxAttempts) => {
  await pool.execute(
    `UPDATE user_auth
     SET failed_attempts = failed_attempts + 1,
         blocked_at = IF(failed_attempts + 1 >= ?, NOW(), blocked_at)
     WHERE user_id = ?`,
    [maxAttempts, userId],
  );
  const [rows] = await pool.execute(
    "SELECT failed_attempts FROM user_auth WHERE user_id = ?",
    [userId],
  );
  return rows[0].failed_attempts;
};

// Successful login: clear the counter/lock and record last_login_at.
export const resetFailedAttempts = async (userId) => {
  await pool.execute(
    `UPDATE user_auth
     SET failed_attempts = 0, blocked_at = NULL, last_login_at = NOW()
     WHERE user_id = ?`,
    [userId],
  );
};

export const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM users ORDER BY created_at DESC`,
  );
  return rows;
};

export const updateUserRole = async (userId, role) => {
  await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
};

// FK cascade also removes the user's auth row, likes and comments.
// Their uploaded packs remain (creator_id has no FK).
export const deleteUser = async (userId) => {
  await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
};
