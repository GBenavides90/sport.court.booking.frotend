import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // Using Vite proxy
});

api.interceptors.request.use(
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('token');
      // Optional: Redirect to login or trigger an event
    }
    return Promise.reject(error);
  }
);

export default api;
