import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import api from '../api/client';
import styles from '../styles/authStyles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password, role });
      setMessage(
        role === 'lecturer'
          ? 'Account created. An admin must approve your lecturer account before you can log in.'
          : 'Account created. You can now log in.'
      );
      setPassword('');
    } catch (err) {
      setMessage(
        err.response?.data?.message || `Cannot reach server: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join the LMS</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

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
        placeholder="Password (at least 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.message}>Account type</Text>
      <View style={styles.roleRow}>
        {['student', 'lecturer'].map((option) => (
          <Pressable
            key={option}
            style={[
              styles.roleButton,
              role === option && styles.roleButtonSelected,
            ]}
            onPress={() => setRole(option)}
          >
            <Text style={styles.roleButtonText}>
              {option[0].toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {role === 'lecturer' ? (
        <Text style={styles.message}>Lecturer accounts need admin approval.</Text>
      ) : null}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Link href="/" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to log in</Text>
        </Pressable>
      </Link>
    </View>
  );
}
