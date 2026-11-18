import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import { isCourseManager } from '../../features/courses/courseAccess';
import { getCurrentUser } from '../../services/authService';
import { getCourse } from '../../services/courseService';
import { deleteQuiz as deleteQuizRequest, getCourseQuizzes, getMyQuizAttempt, setQuizPublished } from '../../services/quizService';
import getErrorMessage from '../../utils/getErrorMessage';
import getRouteParam from '../../utils/getRouteParam';
import styles from '../../styles';

export default function CourseQuizzesScreen() {
  const { courseId: routeCourseId } = useLocalSearchParams();
  const courseId = getRouteParam(routeCourseId);
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionQuizId, setActionQuizId] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [retry, setRetry] = useState(0);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [courseResponse, userResponse, quizzesResponse] = await Promise.all([
        getCourse(courseId),
        getCurrentUser(),
        getCourseQuizzes(courseId),
      ]);
      setCourse(courseResponse.data);
      setUser(userResponse.data);

      let loadedQuizzes = quizzesResponse.data;
      if (userResponse.data.role === 'student') {
        loadedQuizzes = await Promise.all(
          loadedQuizzes.map(async (quiz) => {
            try {
              const attemptResponse = await getMyQuizAttempt(quiz._id);
              return { ...quiz, myAttempt: attemptResponse.data };
            } catch (attemptError) {
              if (attemptError.response?.status === 404) return quiz;
              throw attemptError;
            }
          })
        );
      }
      setQuizzes(loadedQuizzes);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load quizzes'));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const timeout = setTimeout(() => loadQuizzes(), 0);
    return () => clearTimeout(timeout);
  }, [loadQuizzes, retry]);

  const togglePublish = async (quiz) => {
    setActionQuizId(quiz._id);
    setMessage('');
    try {
      await setQuizPublished(quiz._id, !quiz.isPublished);
      setMessage(quiz.isPublished ? 'Quiz unpublished.' : 'Quiz published.');
      await loadQuizzes();
    } catch (actionError) {
      setMessage(getErrorMessage(actionError, 'Could not update quiz'));
    } finally {
      setActionQuizId('');
    }
  };

  const deleteQuiz = async (quizId) => {
    setActionQuizId(quizId);
    setMessage('');
    try {
      await deleteQuizRequest(quizId);
      setConfirmDeleteId('');
      setMessage('Quiz deleted.');
      await loadQuizzes();
    } catch (actionError) {
      setMessage(getErrorMessage(actionError, 'Could not delete quiz'));
    } finally {
      setActionQuizId('');
    }
  };

  const isManager = isCourseManager(course, user);

  if (loading) {
    return <LoadingState message="Loading quizzes..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Quizzes"
        message={error}
        onRetry={() => setRetry((count) => count + 1)}
      />
    );
  }

  return (
    <View style={styles.dashboardPage}>
      <Link href={`/course/${courseId}`} style={styles.textButtonLabel}>‹ Back to course</Link>
      <View style={styles.quizHeader}>
        <View style={styles.quizHeaderText}>
          <Text style={styles.dashboardTitle}>Quizzes</Text>
          <Text style={styles.dashboardWelcome}>{course?.title}</Text>
        </View>
        {isManager ? (
          <Link href={{ pathname: '/quiz-editor', params: { courseId } }} asChild>
            <Pressable style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Create</Text>
            </Pressable>
          </Link>
        ) : null}
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {quizzes.length === 0 ? (
        <Text style={styles.message}>
          {isManager ? 'No quizzes have been created for this course yet.' : 'No published quizzes are available yet.'}
        </Text>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(quiz) => quiz._id}
          contentContainerStyle={styles.courseList}
          renderItem={({ item: quiz }) => {
            const attempt = quiz.myAttempt;
            return (
              <View style={styles.courseCard}>
                <Text style={styles.courseTitle}>{quiz.title}</Text>
                <Text style={styles.courseLecturer}>Time limit: {quiz.timeLimit} minute(s)</Text>
                {isManager ? (
                  <Text style={styles.quizStatus}>{quiz.isPublished ? 'Published' : 'Draft'}</Text>
                ) : attempt ? (
                  <Text style={styles.quizStatus}>
                    {attempt.status === 'submitted'
                      ? `Completed · ${attempt.score}/${attempt.totalMarks}`
                      : attempt.status === 'expired'
                        ? 'Expired'
                        : 'In progress'}
                  </Text>
                ) : null}

                {isManager ? (
                  <View>
                    {!quiz.isPublished ? (
                      <Link href={{ pathname: '/quiz-editor', params: { courseId, quizId: quiz._id } }} asChild>
                        <Pressable style={styles.secondaryAction}>
                          <Text style={styles.secondaryButtonText}>Edit draft</Text>
                        </Pressable>
                      </Link>
                    ) : null}
                    <Pressable
                      style={styles.secondaryAction}
                      onPress={() => togglePublish(quiz)}
                      disabled={actionQuizId === quiz._id}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {actionQuizId === quiz._id ? 'Saving...' : quiz.isPublished ? 'Unpublish' : 'Publish'}
                      </Text>
                    </Pressable>
                    <Link href={{ pathname: '/quiz-results/[quizId]', params: { quizId: quiz._id } }} asChild>
                      <Pressable style={styles.secondaryAction}>
                        <Text style={styles.secondaryButtonText}>View attempts</Text>
                      </Pressable>
                    </Link>
                    {confirmDeleteId === quiz._id ? (
                      <View style={styles.confirmBox}>
                        <Text style={styles.message}>Delete this quiz and its attempts?</Text>
                        <View style={styles.actionRow}>
                          <Pressable
                            style={styles.dangerAction}
                            onPress={() => deleteQuiz(quiz._id)}
                            disabled={actionQuizId === quiz._id}
                          >
                            <Text style={styles.dangerButtonText}>Yes, delete</Text>
                          </Pressable>
                          <Pressable style={styles.secondaryAction} onPress={() => setConfirmDeleteId('')}>
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <Pressable style={styles.secondaryAction} onPress={() => setConfirmDeleteId(quiz._id)}>
                        <Text style={styles.dangerButtonText}>Delete quiz</Text>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  <Link href={`/take-quiz/${quiz._id}`} asChild>
                    <Pressable style={styles.button}>
                      <Text style={styles.buttonText}>
                        {attempt?.status === 'in-progress' ? 'Resume quiz' : attempt ? 'View result' : 'Start quiz'}
                      </Text>
                    </Pressable>
                  </Link>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
