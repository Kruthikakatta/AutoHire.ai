import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

export const jobAPI = {
  getJobs: () => api.get('/jobs'),
  scanEmails: () => api.post('/jobs/scan'),
  getJob: (id) => api.get(`/jobs/${id}`)
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData),
  optimize: (jobId) => api.post(`/resume/optimize/${jobId}`),
  getHistory: () => api.get('/resume/history')
};

export const applicationAPI = {
  getAll: () => api.get('/applications'),
  apply: (jobId) => api.post(`/applications/apply/${jobId}`),
  getStats: () => api.get('/applications/stats')
};

export default api;
