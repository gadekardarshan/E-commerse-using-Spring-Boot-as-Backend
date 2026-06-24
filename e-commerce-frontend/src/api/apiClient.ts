import axios from 'axios';

// Create a single shared Axios instance for both customer (/api/) and admin (/admin/) routes
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor to automatically attach JWT token if it exists in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
