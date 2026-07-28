import apiClient from "./client";

export async function listProducts(params = {}) {
  const { data } = await apiClient.get("/catalog/products/", { params });
  return data;
}

export async function getProduct(productId) {
  const { data } = await apiClient.get(`/catalog/products/${productId}/`);
  return data;
}

export async function listCategories(params = {}) {
  const { data } = await apiClient.get("/catalog/categories/", { params: { page_size: 50, ...params } });
  return data;
}

export async function listBrands(params = {}) {
  const { data } = await apiClient.get("/catalog/brands/", { params: { page_size: 50, ...params } });
  return data;
}
