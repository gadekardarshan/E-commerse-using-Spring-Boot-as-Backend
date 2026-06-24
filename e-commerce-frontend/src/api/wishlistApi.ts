import apiClient from './apiClient';
import type { Wishlist } from '../types/wishlist';
import axios from 'axios';

// Fetch wishlist for a user
export const getWishlist = async (userId: number): Promise<Wishlist> => {
  try {
    const response = await apiClient.get<Wishlist>(`/api/wishlist/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch wishlist');
    }
    throw new Error('An unexpected error occurred while fetching wishlist');
  }
};

// Add product to wishlist
export const addToWishlist = async (userId: number, productId: number): Promise<Wishlist> => {
  try {
    const response = await apiClient.post<Wishlist>(`/api/wishlist/add?userId=${userId}&productId=${productId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to add to wishlist');
    }
    throw new Error('An unexpected error occurred while adding to wishlist');
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (userId: number, productId: number): Promise<Wishlist> => {
  try {
    const response = await apiClient.post<Wishlist>(`/api/wishlist/remove?userId=${userId}&productId=${productId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to remove from wishlist');
    }
    throw new Error('An unexpected error occurred while removing from wishlist');
  }
};
