import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';
import styles from '../styles/authStyles';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        await SecureStore.deleteItemAsync('token');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading your account...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.page}>
      <Text style={styles.title}>LMS App</Text>
      <Text style={styles.message}>Welcome, {user.name}</Text>
      <Text style={styles.message}>Role: {user.role}</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}
