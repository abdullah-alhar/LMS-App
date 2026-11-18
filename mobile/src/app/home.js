import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getCurrentUser } from '../services/authService';
import { clearSessionToken } from '../services/sessionStorage';
import { getCourses, getMyCourses } from '../services/courseService';
import getErrorMessage from '../utils/getErrorMessage';
import styles from '../styles';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [courseError, setCourseError] = useState('');
  const [retryAccountLoad, setRetryAccountLoad] = useState(0);

  const loadMyCourses = useCallback(async () => {
    setCourseError('');
    setLoadingCourses(true);

    try {
      const response = await getMyCourses();
      setCourses(response.data);
    } catch (err) {
      setCourseError(
        getErrorMessage(err, 'Could not load courses')
      );
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const loadManagedCourses = async (account) => {
    setCourseError('');
    setLoadingCourses(true);

    try {
      const response = await getCourses();
      const visibleCourses = account.role === 'admin'
        ? response.data
        : response.data.filter((course) => course.lecturer?._id === account._id);
      setCourses(visibleCourses);
    } catch (err) {
      setCourseError(
        getErrorMessage(err, 'Could not load courses')
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      setAccountError('');
      setLoadingAccount(true);

      try {
        const response = await getCurrentUser();
        setUser(response.data);
        if (response.data.role !== 'student') {
          await loadManagedCourses(response.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          await clearSessionToken();
          router.replace('/');
        } else {
          setAccountError(
            getErrorMessage(err, 'Could not load your account')
          );
        }
      } finally {
        setLoadingAccount(false);
      }
    };

    loadUser();
  }, [retryAccountLoad]);

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'student') {
        loadMyCourses();
      }
    }, [user, loadMyCourses])
  );

  const handleLogout = async () => {
    await clearSessionToken();
    router.replace('/');
  };

  if (loadingAccount) {
    return <LoadingState message="Loading your account..." />;
  }

  if (accountError) {
    return (
      <ErrorState
        title="LMS App"
        message={accountError}
        onRetry={() => setRetryAccountLoad((attempt) => attempt + 1)}
      />
    );
  }

  if (!user) return null;

  return (
    <View style={styles.dashboardPage}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.dashboardTitle}>LMS App</Text>
          <Text style={styles.dashboardWelcome}>Welcome, {user.name}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {user.role === 'student' ? 'My courses' : 'Courses'}
        </Text>
        <View style={styles.headerActions}>
          {user.role === 'lecturer' ? (
            <Link href="/create-course" asChild>
              <Pressable style={styles.textButton}>
                <Text style={styles.textButtonLabel}>Create</Text>
              </Pressable>
            </Link>
          ) : null}
          {user.role === 'student' ? (
            <Pressable style={styles.textButton} onPress={loadMyCourses}>
              <Text style={styles.textButtonLabel}>Refresh</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.textButton}
              onPress={() => loadManagedCourses(user)}
            >
              <Text style={styles.textButtonLabel}>Refresh</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loadingCourses ? (
        <View style={styles.loadingCourses}>
          <ActivityIndicator size="large" />
          <Text style={styles.message}>Loading your courses...</Text>
        </View>
      ) : courseError ? (
        <View>
          <Text style={styles.message}>{courseError}</Text>
          <Pressable style={styles.button} onPress={loadMyCourses}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : courses.length === 0 && user.role === 'student' ? (
        <View>
          <Text style={styles.message}>You are not enrolled in any courses yet.</Text>
          <Link href="/browse-courses" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Browse courses</Text>
            </Pressable>
          </Link>
        </View>
      ) : courses.length === 0 ? (
        <Text style={styles.message}>You do not have any courses yet.</Text>
      ) : (
        <View style={styles.courseListArea}>
          {user.role === 'student' ? (
            <Link href="/browse-courses" asChild>
              <Pressable style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse all courses</Text>
              </Pressable>
            </Link>
          ) : null}
          <FlatList
            data={courses}
            keyExtractor={(course) => course._id}
            contentContainerStyle={styles.courseList}
            renderItem={({ item: course }) => (
              <Link href={`/course/${course._id}`} asChild>
                <Pressable style={styles.courseCard}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  {course.description ? (
                    <Text style={styles.courseDescription}>{course.description}</Text>
                  ) : null}
                  <Text style={styles.courseLecturer}>
                    Lecturer: {course.lecturer?.name || 'Not listed'}
                  </Text>
                  <Text style={styles.courseOpenLabel}>Open course →</Text>
                </Pressable>
              </Link>
            )}
          />
        </View>
      )}
    </View>
  );
}
