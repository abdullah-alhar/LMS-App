import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import api from '../api/client';
import styles from '../styles/authStyles';

const newQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  marks: '1',
});

export default function QuizEditorScreen() {
  const params = useLocalSearchParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const quizId = Array.isArray(params.quizId) ? params.quizId[0] : params.quizId;
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState('10');
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loadingQuiz, setLoadingQuiz] = useState(Boolean(quizId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!quizId) return;
    const loadQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`);
        setTitle(response.data.title);
        setTimeLimit(String(response.data.timeLimit));
        setQuestions(response.data.questions.map((question) => ({
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
          marks: String(question.marks),
        })));
      } catch (err) {
        setMessage(err.response?.data?.message || `Could not load quiz: ${err.message}`);
      } finally {
        setLoadingQuiz(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const updateQuestion = (questionIndex, changes) => {
    setQuestions((current) => current.map((question, index) =>
      index === questionIndex ? { ...question, ...changes } : question
    ));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = question.options.map((option, itemIndex) =>
        itemIndex === optionIndex ? value : option
      );
      return { ...question, options };
    }));
  };

  const addOption = (questionIndex) => {
    setQuestions((current) => current.map((question, index) =>
      index === questionIndex && question.options.length < 6
        ? { ...question, options: [...question.options, ''] }
        : question
    ));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex || question.options.length <= 2) return question;
      const options = question.options.filter((_, itemIndex) => itemIndex !== optionIndex);
      let correctIndex = question.correctIndex;
      if (correctIndex === optionIndex) correctIndex = Math.max(0, optionIndex - 1);
      else if (correctIndex > optionIndex) correctIndex -= 1;
      return { ...question, options, correctIndex };
    }));
  };

  const handleSave = async () => {
    setMessage('');
    if (!title.trim()) {
      setMessage('Enter a quiz title.');
      return;
    }
    if (!Number.isInteger(Number(timeLimit)) || Number(timeLimit) < 1 || Number(timeLimit) > 180) {
      setMessage('Time limit must be a whole number from 1 to 180 minutes.');
      return;
    }

    const preparedQuestions = questions.map((question) => ({
      text: question.text.trim(),
      options: question.options.map((option) => option.trim()),
      correctIndex: question.correctIndex,
      marks: Number(question.marks),
    }));

    for (let index = 0; index < preparedQuestions.length; index += 1) {
      const question = preparedQuestions[index];
      if (!question.text || question.options.some((option) => !option)) {
        setMessage(`Fill in the text and every option for question ${index + 1}.`);
        return;
      }
      if (!Number.isInteger(question.marks) || question.marks < 1) {
        setMessage(`Marks for question ${index + 1} must be a whole number of at least 1.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        timeLimit: Number(timeLimit),
        questions: preparedQuestions,
      };
      if (quizId) await api.patch(`/quizzes/${quizId}`, payload);
      else await api.post(`/courses/${courseId}/quizzes`, payload);
      router.replace(`/course-quizzes/${courseId}`);
    } catch (err) {
      setMessage(err.response?.data?.message || `Could not save quiz: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loadingQuiz) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading quiz...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailPage}>
      <Link href={`/course-quizzes/${courseId}`} style={styles.textButtonLabel}>‹ Back to quizzes</Link>
      <Text style={styles.title}>{quizId ? 'Edit draft quiz' : 'Create quiz'}</Text>
      <TextInput style={styles.input} placeholder="Quiz title" value={title} onChangeText={setTitle} maxLength={150} />
      <TextInput
        style={styles.input}
        placeholder="Time limit in minutes"
        value={timeLimit}
        onChangeText={setTimeLimit}
        keyboardType="number-pad"
      />

      {questions.map((question, questionIndex) => (
        <View key={`question-${questionIndex}`} style={styles.courseCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Question {questionIndex + 1}</Text>
            {questions.length > 1 ? (
              <Pressable
                style={styles.textButton}
                onPress={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}
              >
                <Text style={styles.dangerButtonText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Question text"
            value={question.text}
            onChangeText={(value) => updateQuestion(questionIndex, { text: value })}
            multiline
          />
          <Text style={styles.courseLecturer}>Tap the correct answer below.</Text>
          {question.options.map((option, optionIndex) => (
            <View key={`option-${questionIndex}-${optionIndex}`} style={styles.optionEditorRow}>
              <Pressable
                style={[
                  styles.correctOptionButton,
                  question.correctIndex === optionIndex && styles.correctOptionSelected,
                ]}
                onPress={() => updateQuestion(questionIndex, { correctIndex: optionIndex })}
              >
                <Text style={styles.correctOptionText}>
                  {question.correctIndex === optionIndex ? '✓' : `${optionIndex + 1}`}
                </Text>
              </Pressable>
              <TextInput
                style={[styles.input, styles.optionInput]}
                placeholder={`Option ${optionIndex + 1}`}
                value={option}
                onChangeText={(value) => updateOption(questionIndex, optionIndex, value)}
              />
              {question.options.length > 2 ? (
                <Pressable style={styles.textButton} onPress={() => removeOption(questionIndex, optionIndex)}>
                  <Text style={styles.dangerButtonText}>×</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          {question.options.length < 6 ? (
            <Pressable style={styles.secondaryAction} onPress={() => addOption(questionIndex)}>
              <Text style={styles.secondaryButtonText}>Add option</Text>
            </Pressable>
          ) : null}
          <TextInput
            style={[styles.input, styles.marksInput]}
            placeholder="Marks"
            value={question.marks}
            onChangeText={(value) => updateQuestion(questionIndex, { marks: value })}
            keyboardType="number-pad"
          />
        </View>
      ))}

      <Pressable style={styles.secondaryAction} onPress={() => setQuestions((current) => [...current, newQuestion()])}>
        <Text style={styles.secondaryButtonText}>Add question</Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{quizId ? 'Save draft' : 'Create draft'}</Text>}
      </Pressable>
    </ScrollView>
  );
}
