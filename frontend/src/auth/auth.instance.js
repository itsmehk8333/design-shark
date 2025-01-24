import axios from 'axios';

// Base instance for auth (login/signup)
export const authAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Protected instance for authenticated requests
const protectedAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
protectedAPI.interceptors.request.use(
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

// Add response interceptor
protectedAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log(41)
      originalRequest._retry = true;
      try {
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000)
        return Promise.reject(error);
      } catch (error) {
        // Handle refresh token failure (logout user)
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000)
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default protectedAPI;