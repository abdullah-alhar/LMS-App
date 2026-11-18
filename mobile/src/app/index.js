import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Link, router } from 'expo-router';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import KeyboardForm from '../components/KeyboardForm';
import LoadingState from '../components/LoadingState';
import { getCurrentUser, login } from '../services/authService';
import { clearSessionToken, getSessionToken, saveSessionToken } from '../services/sessionStorage';
import getErrorMessage from '../utils/getErrorMessage';
import styles from '../styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    const restoreLogin = async () => {
      try {
        const token = await getSessionToken();

        if (token) {
          await getCurrentUser();
          router.replace('/home');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          await clearSessionToken();
          setMessage('Your saved session expired. Please log in again.');
        } else {
          setMessage(getErrorMessage(error, 'Could not check your saved login'));
        }
      } finally {
        setCheckingLogin(false);
      }
    };

    restoreLogin();
  }, []);

  const handleLogin = async () => {
    setMessage('');
    if (!email.trim() || !password) {
      setMessage('Enter your email and password.');
      return;
    }
    setLoading(true);

    try {
      const response = await login({ email: email.trim(), password });
      await saveSessionToken(response.data.token);
      router.replace('/home');
    } catch (err) {
      setMessage(
        getErrorMessage(err, 'Could not log in')
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <LoadingState message="Checking saved login..." />
    );
  }

  return (
    <KeyboardForm contentContainerStyle={styles.page}>
      <Text style={styles.title}>LMS App</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>

      <AppTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <AppTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AppButton
        onPress={handleLogin}
        disabled={loading}
        loading={loading}
      >
        <Text style={styles.buttonText}>Log in</Text>
      </AppButton>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Link href="/register" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Create an account</Text>
        </Pressable>
      </Link>
    </KeyboardForm>
  );
}
