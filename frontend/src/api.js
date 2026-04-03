import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getMonitors = () => axios.get(`${API_URL}/monitors`).then(res => res.data);
export const addMonitor = (data) => axios.post(`${API_URL}/monitors`, data).then(res => res.data);
export const deleteMonitor = (id) => axios.delete(`${API_URL}/monitors/${id}`);
export const getLogs = (id) => axios.get(`${API_URL}/monitors/${id}/logs`).then(res => res.data);
