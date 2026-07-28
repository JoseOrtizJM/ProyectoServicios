import apiClient from "./client";

export async function getDashboardSummary() {
  const { data } = await apiClient.get("/dashboard/summary/");
  return data;
}

export async function getSalesChart(period = "week") {
  const { data } = await apiClient.get("/dashboard/sales-chart/", { params: { period } });
  return data;
}

export async function getTopProducts(limit = 10) {
  const { data } = await apiClient.get("/dashboard/top-products/", { params: { limit } });
  return data;
}

export async function listAdminUsers(params = {}) {
  const { data } = await apiClient.get("/auth/admin/users/", { params });
  return data;
}

export async function updateAdminUser(userId, payload) {
  const { data } = await apiClient.patch(`/auth/admin/users/${userId}/`, payload);
  return data;
}

export async function listAdminOrders(params = {}) {
  const { data } = await apiClient.get("/orders/admin/", { params });
  return data;
}

export async function updateOrderStatus(orderId, statusValue) {
  const { data } = await apiClient.patch(`/orders/admin/${orderId}/status/`, { status: statusValue });
  return data;
}

export async function listAdminReviews(params = {}) {
  const { data } = await apiClient.get("/reviews/admin/", { params });
  return data;
}

export async function deleteReview(reviewId) {
  await apiClient.delete(`/reviews/${reviewId}/`);
}
