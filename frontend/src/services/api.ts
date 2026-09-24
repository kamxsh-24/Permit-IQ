import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Base Axios API Client for PTW CMMS.
 * Configured using VITE_API_URL environment variable.
 */
const baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Inject Auth Token placeholder when available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized error logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status} - ${error.response.config?.url}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error('[API Network Error] No response received from server at', baseURL);
    } else {
      console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
