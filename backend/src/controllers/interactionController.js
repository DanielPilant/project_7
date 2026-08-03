import * as interactionModel from "../models/interactionModel.js";

// Likes/comments are open to any logged-in user. The client sends its userId
// (no server session yet); returns fresh { count, liked } after each change.

export const likeProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    await interactionModel.likeProduct(userId, req.params.id);
    const info = await interactionModel.getLikeInfo(req.params.id, userId);
    res.status(201).json(info);
  } catch (error) {
    console.error("Error liking product:", error);
    res.status(500).json({ error: "Failed to like product." });
  }
};

export const unlikeProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    await interactionModel.unlikeProduct(userId, req.params.id);
    const info = await interactionModel.getLikeInfo(req.params.id, userId);
    res.json(info);
  } catch (error) {
    console.error("Error unliking product:", error);
    res.status(500).json({ error: "Failed to unlike product." });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await interactionModel.getCommentsForProduct(req.params.id);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment } = req.body;
    if (!userId || !comment?.trim()) {
      return res
        .status(400)
        .json({ error: "userId and a non-empty comment are required." });
    }

    await interactionModel.addComment(userId, req.params.id, comment.trim());
    // Return the refreshed list so the client can just replace its state.
    const comments = await interactionModel.getCommentsForProduct(req.params.id);
    res.status(201).json(comments);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
};

// A comment can be deleted by its author or by an admin.
export const deleteComment = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const comment = await interactionModel.getCommentById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    const isOwner = String(comment.user_id) === String(requesterId);
    if (requesterRole !== "admin" && !isOwner) {
      return res.status(403).json({ error: "Not allowed — not your comment." });
    }

    await interactionModel.deleteComment(req.params.commentId);
    res.json({ success: true, id: Number(req.params.commentId) });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment." });
  }
};

// The current user's likes + comments (profile "Actions").
export const getUserActivity = async (req, res) => {
  try {
    const likes = await interactionModel.getUserLikes(req.params.id);
    const comments = await interactionModel.getUserComments(req.params.id);
    res.json({ likes, comments });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Failed to fetch user activity." });
  }
};

// Every comment across the site (admin content panel).
export const getAllComments = async (req, res) => {
  try {
    const comments = await interactionModel.getAllComments();
    res.json(comments);
  } catch (error) {
    console.error("Error fetching all comments:", error);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
};
