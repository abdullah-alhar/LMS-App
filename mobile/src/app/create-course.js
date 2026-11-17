import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import api from '../api/client';
import styles from '../styles/authStyles';

export default function CreateCourseScreen() {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [enrolKey, setEnrolKey] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setMessage('');

    if (!title.trim() || !code.trim() || !enrolKey.trim()) {
      setMessage('Course title, code, and enrolment key are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/courses', {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        enrolKey: enrolKey.trim(),
      });
      router.replace(`/course/${response.data._id}`);
    } catch (err) {
      setMessage(
        err.response?.data?.message || `Could not create course: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formPage}>
      <Text style={styles.title}>Create a course</Text>
      <Text style={styles.subtitle}>Students use the enrolment key to join.</Text>

      <TextInput
        style={styles.input}
        placeholder="Course title"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <TextInput
        style={styles.input}
        placeholder="Course code"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Enrolment key"
        value={enrolKey}
        onChangeText={setEnrolKey}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Create course</Text>
        )}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Link href="/home" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </Link>
    </View>
  );
}
