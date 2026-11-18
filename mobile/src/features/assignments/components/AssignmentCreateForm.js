import { useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../../components/AppButton';
import AppTextInput from '../../../components/AppTextInput';
import styles from '../../../styles';

export default function AssignmentCreateForm({ onCreate, saving }) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    const parsedDate = new Date(dueDate);
    const marks = Number(maxMarks);
    if (!title.trim() || Number.isNaN(parsedDate.getTime()) || !Number.isFinite(marks) || marks < 1) {
      setMessage('Enter a title, a valid due date and time, and marks of at least 1.');
      return;
    }

    const created = await onCreate({
      title: title.trim(),
      instructions: instructions.trim(),
      dueDate: parsedDate.toISOString(),
      maxMarks: marks,
    });
    if (!created) return;
    setTitle('');
    setInstructions('');
    setDueDate('');
    setMaxMarks('100');
  };

  return (
    <View style={styles.courseCard}>
      <Text style={styles.sectionTitle}>Create assignment</Text>
      <AppTextInput placeholder="Assignment title" value={title} onChangeText={setTitle} />
      <AppTextInput
        style={styles.multilineInput}
        placeholder="Instructions"
        value={instructions}
        onChangeText={setInstructions}
        multiline
      />
      <AppTextInput
        placeholder="Due date and time, e.g. 2026-12-01T23:59"
        value={dueDate}
        onChangeText={setDueDate}
        autoCapitalize="none"
      />
      <AppTextInput
        placeholder="Maximum marks"
        value={maxMarks}
        onChangeText={setMaxMarks}
        keyboardType="number-pad"
      />
      <AppButton onPress={submit} loading={saving}>
        <Text style={styles.buttonText}>Create assignment</Text>
      </AppButton>
      {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
    </View>
  );
}
