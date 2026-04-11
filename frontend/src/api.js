import axios from 'axios';
import { getToken, removeToken, TOKEN_KEY } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken();
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

export const loginRequest = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data);

export const registerRequest = (email, password) =>
  api.post('/auth/register', { email, password }).then((res) => res.data);

export const getMonitors = () => api.get('/monitors').then((res) => res.data);
export const addMonitor = (data) => api.post('/monitors', data).then((res) => res.data);
export const deleteMonitor = (id) => api.delete(`/monitors/${id}`);
export const getLogs = (id) => api.get(`/monitors/${id}/logs`).then((res) => res.data);

export const exportLogsCsv = (id) => {
  const token = getToken();
  return fetch(`${api.defaults.baseURL}/monitors/${id}/logs/csv`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.blob());
};

export const reportPlatformVisit = () => api.post('/analytics/visit').catch(() => {});
export const getPlatformVisits = () => api.get('/analytics/visits').then(res => res.data).catch(() => []);
