import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import api from '../../api/client';
import styles from '../../styles/authStyles';

export default function QuizResultsScreen() {
  const { quizId: routeQuizId } = useLocalSearchParams();
  const quizId = Array.isArray(routeQuizId) ? routeQuizId[0] : routeQuizId;
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [quizResponse, attemptsResponse] = await Promise.all([
        api.get(`/quizzes/${quizId}`),
        api.get(`/quizzes/${quizId}/attempts`),
      ]);
      setQuiz(quizResponse.data);
      setAttempts(attemptsResponse.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || `Could not load results: ${loadError.message}`);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    const timeout = setTimeout(() => loadResults(), 0);
    return () => clearTimeout(timeout);
  }, [loadResults, retry]);

  if (loading) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading quiz attempts...</Text>
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View style={styles.page}>
        <Text style={styles.message}>{error || 'Quiz not found.'}</Text>
        <Pressable style={styles.button} onPress={() => setRetry((count) => count + 1)}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const courseId = typeof quiz.course === 'object' ? quiz.course._id : quiz.course;

  return (
    <View style={styles.dashboardPage}>
      <Link href={`/course-quizzes/${courseId}`} style={styles.textButtonLabel}>‹ Back to quizzes</Link>
      <Text style={styles.dashboardTitle}>Quiz attempts</Text>
      <Text style={styles.dashboardWelcome}>{quiz.title}</Text>
      <Text style={styles.message}>{attempts.length} attempt(s)</Text>

      {attempts.length === 0 ? (
        <Text style={styles.message}>No students have started this quiz yet.</Text>
      ) : (
        <FlatList
          data={attempts}
          keyExtractor={(attempt) => attempt._id}
          contentContainerStyle={styles.courseList}
          renderItem={({ item: attempt }) => (
            <View style={styles.courseCard}>
              <Text style={styles.courseTitle}>{attempt.student?.name || 'Student'}</Text>
              <Text style={styles.courseLecturer}>{attempt.student?.email}</Text>
              <Text style={styles.quizStatus}>
                {attempt.status === 'submitted'
                  ? `Score: ${attempt.score}/${attempt.totalMarks} · ${Math.round((attempt.score / attempt.totalMarks) * 100)}%`
                  : attempt.status === 'expired'
                    ? 'Expired'
                    : 'In progress'}
              </Text>
              <Text style={styles.courseLecturer}>
                Started: {new Date(attempt.startedAt).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
