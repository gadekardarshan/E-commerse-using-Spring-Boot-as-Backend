import apiClient from './apiClient';
import type { Product } from '../types/product';
import axios from 'axios';

// --- CUSTOMER APIS ---

// Fetch all products with optional filters
export const getAllProducts = async (search?: string, categoryId?: number, sortBy?: string): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>('/api/products', {
      params: { search, categoryId, sortBy },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch products');
    }
    throw new Error('An unexpected error occurred while fetching products');
  }
};

// Fetch details for a specific product
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || `Failed to fetch product with ID ${id}`);
    }
    throw new Error(`An unexpected error occurred while fetching product with ID ${id}`);
  }
};

// --- ADMIN APIS (Prefix "/admin/") ---

// Trigger category/product seed from FakeStore API
export const syncProducts = async (): Promise<void> => {
  try {
    await apiClient.post('/admin/products/sync');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to sync products');
    }
    throw new Error('An unexpected error occurred while syncing products');
  }
};

// Add new product
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await apiClient.post<Product>('/admin/products', productData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to create product');
    }
    throw new Error('An unexpected error occurred while creating product');
  }
};

// Update existing product
export const updateProduct = async (id: number, productData: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await apiClient.put<Product>(`/admin/products/${id}`, productData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to update product');
    }
    throw new Error('An unexpected error occurred while updating product');
  }
};

// Delete product
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/products/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to delete product');
    }
    throw new Error('An unexpected error occurred while deleting product');
  }
};
