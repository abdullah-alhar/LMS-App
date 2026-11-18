import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Link, router } from 'expo-router';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import KeyboardForm from '../components/KeyboardForm';
import { createCourse } from '../services/courseService';
import getErrorMessage from '../utils/getErrorMessage';
import styles from '../styles';

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
      const response = await createCourse({
        title: title.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        enrolKey: enrolKey.trim(),
      });
      router.replace(`/course/${response.data._id}`);
    } catch (err) {
      setMessage(
        getErrorMessage(err, 'Could not create course')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardForm contentContainerStyle={styles.formPage}>
      <Text style={styles.title}>Create a course</Text>
      <Text style={styles.subtitle}>Students use the enrolment key to join.</Text>

      <AppTextInput
        placeholder="Course title"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <AppTextInput
        placeholder="Course code"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <AppTextInput
        style={styles.multilineInput}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <AppTextInput
        placeholder="Enrolment key"
        value={enrolKey}
        onChangeText={setEnrolKey}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <AppButton
        onPress={handleCreate}
        disabled={loading}
        loading={loading}
      >
        <Text style={styles.buttonText}>Create course</Text>
      </AppButton>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Link href="/home" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </Link>
    </KeyboardForm>
  );
}
