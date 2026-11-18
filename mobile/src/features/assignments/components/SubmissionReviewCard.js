import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';
import AppButton from '../../../components/AppButton';
import { gradeAssignmentSubmission } from '../../../services/assignmentService';
import getErrorMessage from '../../../utils/getErrorMessage';
import styles from '../../../styles';

export default function SubmissionReviewCard({ submission, assignment, onGraded }) {
  const [grade, setGrade] = useState(String(submission.grade ?? ''));
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const saveGrade = async () => {
    setMessage('');
    const numericGrade = Number(grade);
    if (grade.trim() === '' || !Number.isFinite(numericGrade) || numericGrade < 0 || numericGrade > assignment.maxMarks) {
      setMessage(`Enter a grade from 0 to ${assignment.maxMarks}.`);
      return;
    }

    setSaving(true);
    try {
      await gradeAssignmentSubmission(submission._id, { grade: numericGrade, feedback });
      await onGraded();
      setMessage('Grade saved.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not save grade'));
    } finally {
      setSaving(false);
    }
  };

  const openFile = async () => {
    try {
      await Linking.openURL(submission.fileUrl);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not open this submission'));
    }
  };

  return (
    <View style={styles.studentRow}>
      <Text style={styles.courseTitle}>{submission.student?.name || 'Student'}</Text>
      <Text style={styles.courseLecturer}>{submission.student?.email}</Text>
      <Text style={styles.courseLecturer}>Submitted: {new Date(submission.submittedAt).toLocaleString()}</Text>
      {submission.text ? <Text style={styles.courseDescription}>{submission.text}</Text> : null}
      {submission.fileUrl ? (
        <Pressable accessibilityRole="link" onPress={openFile}>
          <Text style={styles.textButtonLabel}>Open {submission.fileName || 'submission file'}</Text>
        </Pressable>
      ) : null}
      <TextInput
        accessibilityLabel={`Grade out of ${assignment.maxMarks}`}
        style={styles.input}
        placeholder={`Grade out of ${assignment.maxMarks}`}
        value={grade}
        onChangeText={setGrade}
        keyboardType="decimal-pad"
      />
      <TextInput
        accessibilityLabel="Feedback for student"
        style={[styles.input, styles.multilineInput]}
        placeholder="Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
      <AppButton onPress={saveGrade} loading={saving}>
        <Text style={styles.buttonText}>Save grade</Text>
      </AppButton>
      {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
    </View>
  );
}
