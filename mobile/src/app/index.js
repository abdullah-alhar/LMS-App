import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';
import styles from '../styles/authStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    const restoreLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');

        if (token) {
          await api.get('/auth/me');
          router.replace('/home');
        }
      } catch (err) {
        await SecureStore.deleteItemAsync('token');
      } finally {
        setCheckingLogin(false);
      }
    };

    restoreLogin();
  }, []);

  const handleLogin = async () => {
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync('token', response.data.token);
      router.replace('/home');
    } catch (err) {
      setMessage(
        err.response?.data?.message || `Cannot reach server: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Checking saved login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>LMS App</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Link href="/register" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Create an account</Text>
        </Pressable>
      </Link>
    </View>
  );
}
