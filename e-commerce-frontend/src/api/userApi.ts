import apiClient from './apiClient';
import type { UserResponse } from '../types/auth';
import axios from 'axios';

// Fetch profile details
export const getUserProfile = async (id: number): Promise<UserResponse> => {
  try {
    const response = await apiClient.get<UserResponse>(`/api/users/profile/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch user profile');
    }
    throw new Error('An unexpected error occurred while fetching user profile');
  }
};

// Update profile details (name and email)
export const updateUserProfile = async (id: number, name: string, email: string): Promise<UserResponse> => {
  try {
    const response = await apiClient.put<UserResponse>(`/api/users/profile/${id}`, { name, email });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to update user profile');
    }
    throw new Error('An unexpected error occurred while updating user profile');
  }
};

// Change user password
export const changePassword = async (id: number, oldPassword: String, newPassword: String): Promise<void> => {
  try {
    await apiClient.put(`/api/users/profile/${id}/change-password`, {
      currentPassword: oldPassword,
      newPassword,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to change password');
    }
    throw new Error('An unexpected error occurred while changing password');
  }
};

// Fetch all users list (Admin only)
export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const response = await apiClient.get<UserResponse[]>('/admin/users');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch all users');
    }
    throw new Error('An unexpected error occurred while fetching all users');
  }
};

// Swap user role (Admin only)
export const changeUserRole = async (id: number, role: string): Promise<UserResponse> => {
  try {
    const response = await apiClient.put<UserResponse>(`/admin/users/${id}/role?role=${role}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to change user role');
    }
    throw new Error('An unexpected error occurred while changing user role');
  }
};

// Block/unblock a user (Admin only)
export const toggleUserBlock = async (id: number): Promise<UserResponse> => {
  try {
    const response = await apiClient.put<UserResponse>(`/admin/users/${id}/block`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to toggle user block status');
    }
    throw new Error('An unexpected error occurred while toggling user block status');
  }
};

// Delete user (Admin only)
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/users/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to delete user');
    }
    throw new Error('An unexpected error occurred while deleting user');
  }
};

// Create a new admin manually (Admin only)
export const createAdminUser = async (name: string, email: string, password: string): Promise<UserResponse> => {
  try {
    const response = await apiClient.post<UserResponse>('/admin/users', { name, email, password });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to create admin user');
    }
    throw new Error('An unexpected error occurred while creating admin user');
  }
};
