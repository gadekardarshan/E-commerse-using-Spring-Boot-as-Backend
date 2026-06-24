import apiClient from './apiClient';
import type { Review } from '../types/review';
import axios from 'axios';

// Fetch reviews for a product
export const getProductReviews = async (productId: number): Promise<Review[]> => {
  try {
    const response = await apiClient.get<Review[]>(`/api/reviews/product/${productId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch reviews');
    }
    throw new Error('An unexpected error occurred while fetching reviews');
  }
};

// Add a product review
export const addReview = async (userId: number, productId: number, rating: number, comment: string): Promise<Review> => {
  try {
    const response = await apiClient.post<Review>('/api/reviews', {
      userId,
      productId,
      rating,
      comment,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to submit review');
    }
    throw new Error('An unexpected error occurred while submitting review');
  }
};

// Delete a product review
export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to delete review');
    }
    throw new Error('An unexpected error occurred while deleting review');
  }
};
