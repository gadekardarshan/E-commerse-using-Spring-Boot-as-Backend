import apiClient from './apiClient';
import type { Category } from '../types/category';
import axios from 'axios';

// Fetch all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>('/api/categories');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch categories');
    }
    throw new Error('An unexpected error occurred while fetching categories');
  }
};

// Add category (Admin only)
export const createCategory = async (name: string, description: string): Promise<Category> => {
  try {
    const response = await apiClient.post<Category>('/admin/categories', { name, description });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to create category');
    }
    throw new Error('An unexpected error occurred while creating category');
  }
};

// Update category (Admin only)
export const updateCategory = async (id: number, name: string, description: string): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(`/admin/categories/${id}`, { name, description });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to update category');
    }
    throw new Error('An unexpected error occurred while updating category');
  }
};

// Delete category (Admin only)
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/categories/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to delete category');
    }
    throw new Error('An unexpected error occurred while deleting category');
  }
};
