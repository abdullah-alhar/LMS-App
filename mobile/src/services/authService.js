import api from './httpClient';

export const login = (credentials) => api.post('/auth/login', credentials);

export const register = (account) => api.post('/auth/register', account);

export const getCurrentUser = () => api.get('/auth/me');
