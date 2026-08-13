import * as interactionModel from "../models/interactionModel.js";
import { AppError } from "../utils/httpError.js";

// Likes and comments. Open to any logged-in user; the only real rule is who is
// allowed to delete a comment.
//
// NOTE: the pool can be as small as 1 (DB_CONNECTION_LIMIT=1), so every query
// here runs sequentially — never Promise.all, or a query waits for a connection
// that never frees.

export const likeProduct = async (userId, productId) => {
  if (!userId) throw new AppError(400, "userId is required.");

  await interactionModel.likeProduct(userId, productId);
  return await interactionModel.getLikeInfo(productId, userId);
};

export const unlikeProduct = async (userId, productId) => {
  if (!userId) throw new AppError(400, "userId is required.");

  await interactionModel.unlikeProduct(userId, productId);
  return await interactionModel.getLikeInfo(productId, userId);
};

export const getComments = async (productId) =>
  await interactionModel.getCommentsForProduct(productId);

// Returns the refreshed list so the client can just replace its state.
export const addComment = async (userId, productId, comment) => {
  if (!userId || !comment?.trim()) {
    throw new AppError(400, "userId and a non-empty comment are required.");
  }

  await interactionModel.addComment(userId, productId, comment.trim());
  return await interactionModel.getCommentsForProduct(productId);
};

// A comment can be deleted by its author or by an admin.
export const deleteComment = async (commentId, requester) => {
  const comment = await interactionModel.getCommentById(commentId);
  if (!comment) throw new AppError(404, "Comment not found.");

  const isOwner = String(comment.user_id) === String(requester.id);
  if (requester.role !== "admin" && !isOwner) {
    throw new AppError(403, "Not allowed — not your comment.");
  }

  await interactionModel.deleteComment(commentId);
  return Number(commentId);
};

// The user's likes + comments (profile "Actions").
export const getUserActivity = async (userId) => {
  const likes = await interactionModel.getUserLikes(userId);
  const comments = await interactionModel.getUserComments(userId);
  return { likes, comments };
};

// Every comment across the site (admin content panel).
export const getAllComments = async () => await interactionModel.getAllComments();
