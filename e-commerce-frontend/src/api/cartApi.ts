import apiClient from './apiClient';
import type { CartResponse } from '../types/cart';
import axios from 'axios';

// Add item to shopping cart
export const addToCart = async (userId: number, productId: number, quantity: number): Promise<CartResponse> => {
  try {
    const response = await apiClient.post<CartResponse>('/api/cart/add', {
      userId,
      productId,
      quantity,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to add item to cart');
    }
    throw new Error('An unexpected error occurred while adding to cart');
  }
};

// Fetch cart items for a user
export const getCart = async (userId: number): Promise<CartResponse> => {
  try {
    const response = await apiClient.get<CartResponse>(`/api/cart/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || `Failed to fetch cart`);
    }
    throw new Error(`An unexpected error occurred while fetching cart`);
  }
};

// Update quantity of an item in the cart
export const updateCartQuantity = async (userId: number, productId: number, quantity: number): Promise<CartResponse> => {
  try {
    const response = await apiClient.put<CartResponse>(`/api/cart/update?userId=${userId}&productId=${productId}&quantity=${quantity}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to update quantity');
    }
    throw new Error('An unexpected error occurred while updating quantity');
  }
};

// Remove item from shopping cart
export const removeFromCart = async (userId: number, productId: number): Promise<CartResponse> => {
  try {
    const response = await apiClient.delete<CartResponse>(`/api/cart/remove?userId=${userId}&productId=${productId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to remove item');
    }
    throw new Error('An unexpected error occurred while removing item');
  }
};

// Clear all items in shopping cart
export const clearCart = async (userId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/cart/clear/${userId}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to clear cart');
    }
    throw new Error('An unexpected error occurred while clearing cart');
  }
};
