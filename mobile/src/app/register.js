import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import KeyboardForm from '../components/KeyboardForm';
import { register } from '../services/authService';
import getErrorMessage from '../utils/getErrorMessage';
import styles from '../styles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setMessage('');
    if (!name.trim() || !email.trim() || !password) {
      setMessage('Enter your name, email, and password.');
      return;
    }
    setLoading(true);

    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      setMessage(
        role === 'lecturer'
          ? 'Account created. An admin must approve your lecturer account before you can log in.'
          : 'Account created. You can now log in.'
      );
      setPassword('');
    } catch (err) {
      setMessage(
        getErrorMessage(err, 'Could not create your account')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardForm contentContainerStyle={styles.page}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join the LMS</Text>

      <AppTextInput
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <AppTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <AppTextInput
        placeholder="Password (at least 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.message}>Account type</Text>
      <View style={styles.roleRow}>
        {['student', 'lecturer'].map((option) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: role === option }}
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

      <AppButton
        onPress={handleRegister}
        disabled={loading}
        loading={loading}
      >
        <Text style={styles.buttonText}>Register</Text>
      </AppButton>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Link href="/" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to log in</Text>
        </Pressable>
      </Link>
    </KeyboardForm>
  );
}
