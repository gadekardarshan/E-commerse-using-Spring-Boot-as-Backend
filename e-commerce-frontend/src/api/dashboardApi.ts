import apiClient from './apiClient';
import axios from 'axios';

// Fetch admin dashboard figures and list metrics
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.response?.data || 'Failed to fetch dashboard stats');
    }
    throw new Error('An unexpected error occurred while fetching dashboard stats');
  }
};
