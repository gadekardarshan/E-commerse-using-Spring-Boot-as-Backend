import apiClient from '../api/apiClient';
import type { RegisterRequest, LoginRequest, UserResponse } from '../types/auth';
import axios from 'axios';

// Register user request
export const registerUser = async (data: RegisterRequest): Promise<UserResponse> => {
  try {
    const response = await apiClient.post<UserResponse>('/api/auth/register', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data || 'Registration failed');
      } else if (error.request) {
        throw new Error('Network error: No response received from backend. Check if the server is running.');
      } else {
        throw new Error(error.message);
      }
    }
    throw new Error('An unexpected error occurred during registration');
  }
};

// Login user request
export const loginUser = async (data: LoginRequest): Promise<UserResponse> => {
  try {
    const response = await apiClient.post<UserResponse>('/api/auth/login', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data || 'Login failed');
      } else if (error.request) {
        throw new Error('Network error: No response received from backend. Check if the server is running.');
      } else {
        throw new Error(error.message);
      }
    }
    throw new Error('An unexpected error occurred during login');
  }
};
