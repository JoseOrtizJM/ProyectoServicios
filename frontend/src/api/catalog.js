import apiClient from "./client";

export async function listProducts(params = {}) {
  const { data } = await apiClient.get("/catalog/products/", { params });
  return data;
}

export async function getProduct(productId) {
  const { data } = await apiClient.get(`/catalog/products/${productId}/`);
  return data;
}

export async function createProduct(payload) {
  const { data } = await apiClient.post("/catalog/products/", payload);
  return data;
}

export async function updateProduct(productId, payload) {
  const { data } = await apiClient.patch(`/catalog/products/${productId}/`, payload);
  return data;
}

export async function deleteProduct(productId) {
  await apiClient.delete(`/catalog/products/${productId}/`);
}

export async function listCategories(params = {}) {
  const { data } = await apiClient.get("/catalog/categories/", { params: { page_size: 50, ...params } });
  return data;
}

export async function createCategory(payload) {
  const { data } = await apiClient.post("/catalog/categories/", payload);
  return data;
}

export async function updateCategory(categoryId, payload) {
  const { data } = await apiClient.patch(`/catalog/categories/${categoryId}/`, payload);
  return data;
}

export async function deleteCategory(categoryId) {
  await apiClient.delete(`/catalog/categories/${categoryId}/`);
}

export async function listBrands(params = {}) {
  const { data } = await apiClient.get("/catalog/brands/", { params: { page_size: 50, ...params } });
  return data;
}

export async function createBrand(payload) {
  const { data } = await apiClient.post("/catalog/brands/", payload);
  return data;
}

export async function updateBrand(brandId, payload) {
  const { data } = await apiClient.patch(`/catalog/brands/${brandId}/`, payload);
  return data;
}

export async function deleteBrand(brandId) {
  await apiClient.delete(`/catalog/brands/${brandId}/`);
}
