import apiClient from "./client";

export async function listProductReviews(productId, params = {}) {
  const { data } = await apiClient.get(`/reviews/products/${productId}/`, { params });
  return data;
}

export async function createReview(productId, payload) {
  const { data } = await apiClient.post(`/reviews/products/${productId}/`, payload);
  return data;
}
