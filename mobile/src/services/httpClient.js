import { create as createAxiosInstance } from 'axios';
import { getSessionToken } from './sessionStorage';
import { API_REQUEST_TIMEOUT_MS } from '../constants/network';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

const api = createAxiosInstance({
  baseURL: apiBaseUrl,
  timeout: API_REQUEST_TIMEOUT_MS,
});

api.interceptors.request.use(async (config) => {
  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is missing. Add it to mobile/.env and restart Expo.');
  }

  const token = await getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
