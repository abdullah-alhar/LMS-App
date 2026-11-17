import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import api from '../../api/client';
import styles from '../../styles/authStyles';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function TakeQuizScreen() {
  const { quizId: routeQuizId } = useLocalSearchParams();
  const quizId = Array.isArray(routeQuizId) ? routeQuizId[0] : routeQuizId;
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [attemptStatus, setAttemptStatus] = useState('ready');
  const [answers, setAnswers] = useState([]);
  const [endsAt, setEndsAt] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const quizResponse = await api.get(`/quizzes/${quizId}`);
        setQuiz(quizResponse.data);
        try {
          const attemptResponse = await api.get(`/quizzes/${quizId}/my-attempt`);
          setAttempt(attemptResponse.data);
          setAttemptStatus(
            attemptResponse.data.status === 'in-progress'
              ? 'ready'
              : attemptResponse.data.status
          );
        } catch (attemptError) {
          if (attemptError.response?.status !== 404) throw attemptError;
          setAttempt(null);
          setAttemptStatus('ready');
        }
      } catch (loadError) {
        setError(loadError.response?.data?.message || `Could not load quiz: ${loadError.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const submitAnswers = useCallback(async () => {
    if (submittingRef.current || !quiz) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      setResult(response.data);
      setAttemptStatus('submitted');
      setAttempt((current) => ({
        ...current,
        status: 'submitted',
        score: response.data.score,
        totalMarks: response.data.totalMarks,
      }));
    } catch (submitError) {
      if (submitError.response?.data?.message?.startsWith('Time is up')) {
        setAttemptStatus('expired');
        setAttempt((current) => ({ ...current, status: 'expired' }));
      } else {
        setError(submitError.response?.data?.message || `Could not submit quiz: ${submitError.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [answers, quiz, quizId]);

  useEffect(() => {
    if (attemptStatus !== 'in-progress' || !endsAt) return undefined;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      if (remaining === 0) submitAnswers();
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attemptStatus, endsAt, submitAnswers]);

  const startOrResume = async () => {
    setStarting(true);
    setError('');
    submittingRef.current = false;
    try {
      const response = await api.post(`/quizzes/${quizId}/start`);
      setQuiz(response.data.quiz);
      setAttempt({ _id: response.data.attemptId, status: 'in-progress' });
      setAnswers(response.data.quiz.questions.map(() => null));
      setEndsAt(response.data.endsAt);
      setSecondsLeft(Math.max(0, Math.ceil((new Date(response.data.endsAt).getTime() - Date.now()) / 1000)));
      setAttemptStatus('in-progress');
      setResult(null);
    } catch (startError) {
      setError(startError.response?.data?.message || `Could not start quiz: ${startError.message}`);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.page}>
        <Text style={styles.message}>{error || 'Quiz not found.'}</Text>
        <Link href="/home" style={styles.textButtonLabel}>Back to courses</Link>
      </View>
    );
  }

  const courseId = typeof quiz.course === 'object' ? quiz.course._id : quiz.course;

  if (result) {
    return (
      <ScrollView contentContainerStyle={styles.detailPage}>
        <Text style={styles.title}>Quiz result</Text>
        <Text style={styles.quizScore}>{result.score} / {result.totalMarks}</Text>
        <Text style={styles.message}>{result.percentage}%</Text>
        {result.review.map((item, index) => (
          <View key={`review-${index}`} style={styles.courseCard}>
            <Text style={styles.sectionTitle}>Question {index + 1}</Text>
            <Text style={styles.courseTitle}>{item.question}</Text>
            <Text style={item.isCorrect ? styles.correctResult : styles.incorrectResult}>
              {item.isCorrect ? 'Correct' : 'Incorrect'}
            </Text>
            <Text style={styles.courseLecturer}>
              Your answer: {item.yourAnswer === null ? 'Skipped' : quiz.questions[index].options[item.yourAnswer]}
            </Text>
            <Text style={styles.courseLecturer}>
              Correct answer: {quiz.questions[index].options[item.correctAnswer]}
            </Text>
          </View>
        ))}
        <Link href={`/course/${courseId}`} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Back to course</Text>
          </Pressable>
        </Link>
      </ScrollView>
    );
  }

  if (attemptStatus === 'submitted' || attemptStatus === 'expired') {
    return (
      <View style={styles.page}>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.message}>
          {attemptStatus === 'submitted'
            ? `You already submitted this quiz. Score: ${attempt?.score ?? 0}/${attempt?.totalMarks ?? 0}.`
            : 'Your quiz attempt expired.'}
        </Text>
        {error ? <Text style={styles.message}>{error}</Text> : null}
        <Link href={`/course/${courseId}`} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Back to course</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (attemptStatus !== 'in-progress') {
    return (
      <View style={styles.page}>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.message}>Time limit: {quiz.timeLimit} minute(s)</Text>
        <Text style={styles.message}>{quiz.questions.length} question(s)</Text>
        {attempt?.status === 'in-progress' ? (
          <Text style={styles.message}>You have an unfinished attempt. Resume it to continue.</Text>
        ) : null}
        {error ? <Text style={styles.message}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={startOrResume} disabled={starting}>
          {starting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{attempt?.status === 'in-progress' ? 'Resume quiz' : 'Start quiz'}</Text>}
        </Pressable>
        <Link href={`/course/${courseId}`} style={styles.secondaryButtonText}>Back to course</Link>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailPage}>
      <View style={styles.timerBar}>
        <Text style={styles.timerTitle}>{quiz.title}</Text>
        <Text style={secondsLeft <= 60 ? styles.timerUrgent : styles.timerText}>
          {formatTime(secondsLeft)}
        </Text>
      </View>
      <Text style={styles.quizHint}>Choose one answer for each question. You can skip questions.</Text>
      {quiz.questions.map((question, questionIndex) => (
        <View key={question._id || `question-${questionIndex}`} style={styles.courseCard}>
          <Text style={styles.sectionTitle}>Question {questionIndex + 1}</Text>
          <Text style={styles.courseTitle}>{question.text}</Text>
          <Text style={styles.courseLecturer}>{question.marks} mark(s)</Text>
          {question.options.map((option, optionIndex) => {
            const selected = answers[questionIndex] === optionIndex;
            return (
              <Pressable
                key={`option-${optionIndex}`}
                style={[styles.answerOption, selected && styles.answerOptionSelected]}
                onPress={() => setAnswers((current) => current.map((answer, index) =>
                  index === questionIndex ? optionIndex : answer
                ))}
              >
                <Text style={styles.answerOptionText}>{option}</Text>
              </Pressable>
            );
          })}
          {answers[questionIndex] !== null ? (
            <Pressable
              style={styles.textButton}
              onPress={() => setAnswers((current) => current.map((answer, index) =>
                index === questionIndex ? null : answer
              ))}
            >
              <Text style={styles.textButtonLabel}>Clear answer</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      {error ? <Text style={styles.message}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={submitAnswers} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit answers</Text>}
      </Pressable>
    </ScrollView>
  );
}
