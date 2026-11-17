import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import api from '../api/client';
import styles from '../styles/authStyles';

export default function BrowseCoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrolKeys, setEnrolKeys] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const loadCourses = async () => {
      setError('');
      setLoading(true);

      try {
        const [allCoursesResponse, myCoursesResponse] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/my'),
        ]);

        setCourses(allCoursesResponse.data);
        setEnrolledIds(new Set(myCoursesResponse.data.map((course) => course._id)));
      } catch (err) {
        setError(
          err.response?.data?.message || `Could not load courses: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [retry]);

  const handleEnrol = async (courseId) => {
    const enrolKey = enrolKeys[courseId]?.trim();

    if (!enrolKey) {
      setMessages((current) => ({ ...current, [courseId]: 'Enter the enrolment key first.' }));
      return;
    }

    setLoadingCourse(courseId);
    setMessages((current) => ({ ...current, [courseId]: '' }));

    try {
      const response = await api.post(`/courses/${courseId}/enrol`, { enrolKey });
      setEnrolledIds((current) => new Set(current).add(courseId));
      setEnrolKeys((current) => ({ ...current, [courseId]: '' }));
      setMessages((current) => ({ ...current, [courseId]: response.data.message }));
    } catch (err) {
      if (err.response?.status === 409) {
        setEnrolledIds((current) => new Set(current).add(courseId));
      }
      setMessages((current) => ({
        ...current,
        [courseId]: err.response?.data?.message || `Could not enrol: ${err.message}`,
      }));
    } finally {
      setLoadingCourse('');
    }
  };

  return (
    <View style={styles.browsePage}>
      <View style={styles.browseHeader}>
        <View>
          <Text style={styles.dashboardTitle}>Browse courses</Text>
          <Text style={styles.dashboardWelcome}>Find a course and enter its key to join.</Text>
        </View>
      </View>

      <Link href="/home" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.textButtonLabel}>Back to My Courses</Text>
        </Pressable>
      </Link>

      {loading ? (
        <View style={styles.loadingCourses}>
          <ActivityIndicator size="large" />
          <Text style={styles.message}>Loading courses...</Text>
        </View>
      ) : error ? (
        <View>
          <Text style={styles.message}>{error}</Text>
          <Pressable
            style={styles.button}
            onPress={() => setRetry((attempt) => attempt + 1)}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : courses.length === 0 ? (
        <Text style={styles.message}>There are no courses to show yet.</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(course) => course._id}
          contentContainerStyle={styles.courseList}
          renderItem={({ item: course }) => {
            const isEnrolled = enrolledIds.has(course._id);
            const isEnrolling = loadingCourse === course._id;

            return (
              <View style={styles.courseCard}>
                <Text style={styles.courseCode}>{course.code}</Text>
                <Text style={styles.courseTitle}>{course.title}</Text>
                {course.description ? (
                  <Text style={styles.courseDescription}>{course.description}</Text>
                ) : null}
                <Text style={styles.courseLecturer}>
                  Lecturer: {course.lecturer?.name || 'Not listed'}
                </Text>
                <Link href={`/course/${course._id}`} asChild>
                  <Pressable style={styles.textButton}>
                    <Text style={styles.textButtonLabel}>Course details</Text>
                  </Pressable>
                </Link>

                {isEnrolled ? (
                  <Text style={styles.enrolledLabel}>You are enrolled</Text>
                ) : (
                  <>
                    <TextInput
                      style={styles.courseKeyInput}
                      placeholder="Course enrolment key"
                      value={enrolKeys[course._id] || ''}
                      onChangeText={(value) =>
                        setEnrolKeys((current) => ({
                          ...current,
                          [course._id]: value,
                        }))
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Pressable
                      style={[
                        styles.button,
                        isEnrolling && styles.buttonDisabled,
                      ]}
                      onPress={() => handleEnrol(course._id)}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Enrol</Text>
                      )}
                    </Pressable>
                  </>
                )}

                {messages[course._id] ? (
                  <Text style={styles.message}>{messages[course._id]}</Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
