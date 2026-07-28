import apiClient from "./client";

export async function updateProfile(payload) {
  const { data } = await apiClient.patch("/auth/profile/", payload);
  return data;
}

export async function changePassword(payload) {
  const { data } = await apiClient.post("/auth/change-password/", payload);
  return data;
}
