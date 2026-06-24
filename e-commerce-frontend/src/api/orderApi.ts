import apiClient from './apiClient';
import type { Order } from '../types/order';
import axios from 'axios';

// Place a new order
export const placeOrder = async (userId: number, shippingAddress: string, phone: string): Promise<Order> => {
  try {
    const response = await apiClient.post<Order>('/api/orders', {
      userId,
      shippingAddress,
      phone,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to place order');
    }
    throw new Error('An unexpected error occurred while placing order');
  }
};

// Fetch order history for a customer
export const getMyOrders = async (userId: number): Promise<Order[]> => {
  try {
    const response = await apiClient.get<Order[]>(`/api/orders/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch your orders');
    }
    throw new Error('An unexpected error occurred while fetching orders');
  }
};

// Fetch details for a specific order
export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const response = await apiClient.get<Order>(`/api/orders/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch order details');
    }
    throw new Error('An unexpected error occurred while fetching order details');
  }
};

// Cancel an order (customer operation)
export const cancelOrder = async (orderId: number, userId: number): Promise<Order> => {
  try {
    const response = await apiClient.put<Order>(`/api/orders/${orderId}/cancel?userId=${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to cancel order');
    }
    throw new Error('An unexpected error occurred while cancelling order');
  }
};

// Fetch all orders (Admin only)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await apiClient.get<Order[]>('/admin/orders');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch all orders');
    }
    throw new Error('An unexpected error occurred while fetching all orders');
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  try {
    const response = await apiClient.put<Order>(`/admin/orders/${orderId}/status?status=${status}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to update order status');
    }
    throw new Error('An unexpected error occurred while updating order status');
  }
};
