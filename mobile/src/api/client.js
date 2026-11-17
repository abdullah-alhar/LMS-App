import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';
const api = create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
