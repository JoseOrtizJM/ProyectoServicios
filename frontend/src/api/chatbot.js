import apiClient from "./client";

export async function sendChatMessage(message, history = []) {
  const { data } = await apiClient.post("/chatbot/chat/", { message, history });
  return data;
}
