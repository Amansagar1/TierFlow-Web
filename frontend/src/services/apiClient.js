import axios from 'axios';

// ------------------------------ API Base URL Resolution ------------------------------
const getApiBaseUrl = () => {
  // Client-side execution in the browser
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && typeof envUrl === 'string') {
      const isEnvLocalhost = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
      // When deployed (e.g., *.vercel.app), ignore any stray localhost environment variables
      if (!isLocalhost && isEnvLocalhost) {
        return '/api';
      }
      return envUrl;
    }

    // Default to relative '/api' on the same domain (routed directly by Vercel rewrites)
    return '/api';
  }

  // Server-side execution (SSR)
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/api\/?$/, '')}/api`;
  }
  if (
    process.env.NEXT_PUBLIC_API_BASE_URL &&
    !process.env.NEXT_PUBLIC_API_BASE_URL.includes('localhost')
  ) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ------------------------------ Request Interceptor: Attach JWT Token ------------------------------
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tierflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------ Response Interceptor: Handle 401 Session Expiry ------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      const isAuthRoute =
        window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute) {
        localStorage.removeItem('tierflow_token');
        localStorage.removeItem('tierflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
