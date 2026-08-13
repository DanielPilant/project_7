import * as interactionService from "../services/interactionService.js";
import { respondWithError } from "../utils/httpError.js";

// HTTP only. Rules live in services/interactionService.js, SQL in
// models/interactionModel.js.

export const likeProduct = async (req, res) => {
  try {
    const info = await interactionService.likeProduct(req.user.id, req.params.id);
    res.status(201).json(info);
  } catch (error) {
    respondWithError(res, error, "Error liking product:", "Failed to like product.");
  }
};

export const unlikeProduct = async (req, res) => {
  try {
    const info = await interactionService.unlikeProduct(req.user.id, req.params.id);
    res.json(info);
  } catch (error) {
    respondWithError(res, error, "Error unliking product:", "Failed to unlike product.");
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await interactionService.getComments(req.params.id);
    res.json(comments);
  } catch (error) {
    respondWithError(res, error, "Error fetching comments:", "Failed to fetch comments.");
  }
};

export const addComment = async (req, res) => {
  try {
    const comments = await interactionService.addComment(
      req.user.id,
      req.params.id,
      req.body.comment,
    );
    res.status(201).json(comments);
  } catch (error) {
    respondWithError(res, error, "Error adding comment:", "Failed to add comment.");
  }
};

export const deleteComment = async (req, res) => {
  try {
    const id = await interactionService.deleteComment(req.params.commentId, {
      id: req.user.id,
      role: req.user.role,
    });
    res.json({ success: true, id });
  } catch (error) {
    respondWithError(res, error, "Error deleting comment:", "Failed to delete comment.");
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const activity = await interactionService.getUserActivity(req.params.id);
    res.json(activity);
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error fetching user activity:",
      "Failed to fetch user activity.",
    );
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await interactionService.getAllComments();
    res.json(comments);
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error fetching all comments:",
      "Failed to fetch comments.",
    );
  }
};
