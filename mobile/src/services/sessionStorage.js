import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'token';

export const getSessionToken = () => SecureStore.getItemAsync(SESSION_TOKEN_KEY);

export const saveSessionToken = (token) =>
  SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);

export const clearSessionToken = () =>
  SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
