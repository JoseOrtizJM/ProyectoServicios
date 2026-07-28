import apiClient from "./client";

export async function getCart() {
  const { data } = await apiClient.get("/cart/");
  return data;
}

export async function addCartItem(productId, quantity = 1) {
  const { data } = await apiClient.post("/cart/items/", { product_id: productId, quantity });
  return data;
}

export async function updateCartItem(productId, quantity) {
  const { data } = await apiClient.patch(`/cart/items/${productId}/`, { quantity });
  return data;
}

export async function removeCartItem(productId) {
  await apiClient.delete(`/cart/items/${productId}/`);
}

export async function emptyCart() {
  await apiClient.delete("/cart/");
}
