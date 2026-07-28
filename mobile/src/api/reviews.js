import apiClient from "./client";

export async function listProductReviews(productId, params = {}) {
  const { data } = await apiClient.get(`/reviews/products/${productId}/`, { params });
  return data;
}
