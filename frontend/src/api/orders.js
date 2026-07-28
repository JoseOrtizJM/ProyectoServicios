import apiClient from "./client";

export async function listCards() {
  const { data } = await apiClient.get("/orders/cards/");
  return data;
}

export async function deleteCard(cardId) {
  await apiClient.delete(`/orders/cards/${cardId}/`);
}

export async function checkout(payload) {
  const { data } = await apiClient.post("/orders/checkout/", payload);
  return data;
}
