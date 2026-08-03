import api from "./axios.js";

// Likes + comments + user activity. The client passes its own user id/role
// since there's no server session yet.

// --- likes --- (each returns fresh { count, liked })
export function likeProduct(productId) {
  return api
    .post(`/products/${productId}/like`)
    .then((r) => r.data);
}

export function unlikeProduct(productId) {
  return api
    .delete(`/products/${productId}/like`)
    .then((r) => r.data);
}

// --- comments ---
export function fetchComments(productId) {
  return api.get(`/products/${productId}/comments`).then((r) => r.data);
}

// add returns the refreshed comment list for that pack
export function addComment(productId, comment) {
  return api
    .post(`/products/${productId}/comments`, { comment })
    .then((r) => r.data);
}

export function deleteComment(commentId) {
  return api
    .delete(`/products/comments/${commentId}`)
    .then((r) => r.data);
}

// --- activity / admin ---
export function fetchUserActivity(userId) {
  return api.get(`/users/${userId}/activity`).then((r) => r.data);
}

export function fetchAllComments() {
  return api.get(`/comments`).then((r) => r.data);
}
