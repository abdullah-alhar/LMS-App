import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AppButton from '../../../components/AppButton';
import { DOCUMENT_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from '../../../constants/documentTypes';
import { submitAssignment } from '../../../services/assignmentService';
import getErrorMessage from '../../../utils/getErrorMessage';
import styles from '../../../styles';

export default function StudentSubmissionForm({ assignment, submission, onSubmitted, readOnly = false }) {
  const [text, setText] = useState(submission?.text || '');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const chooseFile = async () => {
    setMessage('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: DOCUMENT_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const selectedFile = result.assets[0];
        if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
          setMessage(`Choose a file no larger than ${MAX_UPLOAD_SIZE_MB} MB.`);
          return;
        }
        setFile(selectedFile);
      }
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not open the file picker'));
    }
  };

  const submit = async () => {
    setMessage('');
    if (!text.trim() && !file) {
      setMessage('Write your answer or choose a file.');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append('text', text.trim());
      if (file) {
        body.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        });
      }
      await submitAssignment(assignment._id, body);
      setFile(null);
      setMessage('Your work was submitted. You can update it before the deadline.');
      await onSubmitted();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not submit'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      {submission ? (
        <View style={styles.confirmBox}>
          <Text style={styles.quizStatus}>Submitted {new Date(submission.submittedAt).toLocaleString()}</Text>
          {submission.fileName ? <Text style={styles.courseLecturer}>File: {submission.fileName}</Text> : null}
          {submission.grade !== undefined ? (
            <Text style={styles.quizStatus}>Grade: {submission.grade}/{assignment.maxMarks}</Text>
          ) : <Text style={styles.quizStatus}>Not graded yet</Text>}
          {submission.feedback ? <Text style={styles.courseDescription}>Feedback: {submission.feedback}</Text> : null}
        </View>
      ) : null}
      {readOnly ? null : (
        <>
      <TextInput
        accessibilityLabel="Written assignment answer"
        style={[styles.input, styles.multilineInput]}
        placeholder="Write your answer (optional if you attach a file)"
        value={text}
        onChangeText={setText}
        multiline
      />
      <Pressable accessibilityRole="button" style={styles.secondaryAction} onPress={chooseFile}>
        <Text style={styles.secondaryButtonText}>
          {file?.name || submission?.fileName || 'Choose a PDF, Word, or PowerPoint file'}
        </Text>
      </Pressable>
      <Text style={styles.courseLecturer}>
        Files can be up to {MAX_UPLOAD_SIZE_MB} MB. Resubmitting replaces your current answer.
      </Text>
      <AppButton onPress={submit} loading={saving}>
        <Text style={styles.buttonText}>{submission ? 'Update submission' : 'Submit work'}</Text>
      </AppButton>
      {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
        </>
      )}
    </View>
  );
}
