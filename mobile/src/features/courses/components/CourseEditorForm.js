import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AppButton from '../../../components/AppButton';
import AppTextInput from '../../../components/AppTextInput';
import styles from '../../../styles';

export default function CourseEditorForm({ course, saving, onSave, onCancel }) {
  const [title, setTitle] = useState(course.title || '');
  const [code, setCode] = useState(course.code || '');
  const [description, setDescription] = useState(course.description || '');
  const [enrolKey, setEnrolKey] = useState('');

  const save = () => onSave({
    title: title.trim(),
    code: code.trim().toUpperCase(),
    description: description.trim(),
    ...(enrolKey.trim() ? { enrolKey: enrolKey.trim() } : {}),
  });

  return (
    <View style={styles.courseCard}>
      <Text style={styles.sectionTitle}>Edit course</Text>
      <AppTextInput placeholder="Course title" value={title} onChangeText={setTitle} />
      <AppTextInput placeholder="Course code" value={code} onChangeText={setCode} autoCapitalize="characters" />
      <AppTextInput
        style={styles.multilineInput}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <AppTextInput
        placeholder="New enrolment key (optional)"
        value={enrolKey}
        onChangeText={setEnrolKey}
        autoCapitalize="none"
      />
      <AppButton onPress={save} loading={saving}>
        <Text style={styles.buttonText}>Save changes</Text>
      </AppButton>
      <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onCancel}>
        <Text style={styles.secondaryButtonText}>Cancel editing</Text>
      </Pressable>
    </View>
  );
}
