import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import ErrorState from '../../components/ErrorState';
import KeyboardForm from '../../components/KeyboardForm';
import LoadingState from '../../components/LoadingState';
import CourseMaterialsSection from '../../features/courses/components/CourseMaterialsSection';
import CourseEditorForm from '../../features/courses/components/CourseEditorForm';
import CourseEnrollmentPanel from '../../features/courses/components/CourseEnrollmentPanel';
import EnrolledStudentsList from '../../features/courses/components/EnrolledStudentsList';
import { isCourseManager } from '../../features/courses/courseAccess';
import { getCurrentUser } from '../../services/authService';
import {
  deleteCourse,
  enrolInCourse,
  getCourse,
  getCourseStudents,
  getMyCourses,
  leaveCourse,
  updateCourse,
} from '../../services/courseService';
import { clearSessionToken } from '../../services/sessionStorage';
import getRouteParam from '../../utils/getRouteParam';
import getErrorMessage from '../../utils/getErrorMessage';
import styles from '../../styles';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const courseId = getRouteParam(id);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentsError, setStudentsError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError('');
    setStudentsError('');

    try {
      const [courseResponse, userResponse] = await Promise.all([
        getCourse(courseId),
        getCurrentUser(),
      ]);
      const loadedCourse = courseResponse.data;
      const loadedUser = userResponse.data;
      const canManageCourse = isCourseManager(loadedCourse, loadedUser);

      setCourse(loadedCourse);
      setUser(loadedUser);
      setIsManager(canManageCourse);

      let enrolled = canManageCourse;
      if (loadedUser.role === 'student') {
        const myCoursesResponse = await getMyCourses();
        enrolled = myCoursesResponse.data.some(
          (item) => String(item._id) === String(courseId)
        );
      }
      setIsEnrolled(enrolled);

      if (canManageCourse) {
        try {
          const studentsResponse = await getCourseStudents(courseId);
          setStudents(studentsResponse.data);
        } catch (studentsRequestError) {
          setStudentsError(getErrorMessage(studentsRequestError, 'Could not load students'));
        }
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        await clearSessionToken();
        router.replace('/');
      } else {
        setError(getErrorMessage(requestError, 'Could not load course'));
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const timeout = setTimeout(() => loadCourse(), 0);
    return () => clearTimeout(timeout);
  }, [loadCourse]);

  const handleEnrol = async (enrolKey) => {
    setMessage('');
    if (!enrolKey) {
      setMessage('Enter the enrolment key first.');
      return false;
    }
    setSaving(true);
    try {
      const response = await enrolInCourse(courseId, enrolKey);
      setIsEnrolled(true);
      setMessage(response.data.message);
      return true;
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not enrol'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    setSaving(true);
    try {
      const response = await leaveCourse(courseId);
      setIsEnrolled(false);
      setMessage(response.data.message);
      return true;
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not leave course'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCourse = async (changes) => {
    setMessage('');
    if (!changes.title || !changes.code) {
      setMessage('Course title and code are required.');
      return;
    }
    setSaving(true);
    try {
      await updateCourse(courseId, changes);
      setCourse((current) => ({ ...current, ...changes }));
      setEditMode(false);
      setMessage('Course updated.');
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not update course'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    setSaving(true);
    try {
      await deleteCourse(courseId);
      router.replace('/home');
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not delete course'));
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading course..." />;
  }

  if (error || !course) {
    return (
      <ErrorState
        title="Course"
        message={error || 'Course not found.'}
        onRetry={loadCourse}
      >
        <Link href="/home" style={styles.secondaryButtonText}>Back to courses</Link>
      </ErrorState>
    );
  }

  return (
    <KeyboardForm contentContainerStyle={styles.detailPage}>
      <Link href="/home" style={styles.textButtonLabel}>‹ Back to courses</Link>

      {editMode ? (
        <CourseEditorForm
          course={course}
          saving={saving}
          onSave={handleSaveCourse}
          onCancel={() => setEditMode(false)}
        />
      ) : (
        <View style={styles.courseDetailCard}>
          <Text style={styles.courseCode}>{course.code}</Text>
          <Text style={styles.detailTitle}>{course.title}</Text>
          <Text style={styles.courseLecturer}>Lecturer: {course.lecturer?.name || 'Not listed'}</Text>
          <Text style={styles.detailDescription}>{course.description || 'No description provided.'}</Text>
          {isManager ? (
            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryAction} onPress={() => setEditMode(true)}>
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.dangerAction} onPress={() => setConfirmDelete(true)}>
                <Text style={styles.dangerButtonText}>Delete course</Text>
              </Pressable>
            </View>
          ) : null}
          {confirmDelete ? (
            <View style={styles.confirmBox}>
              <Text style={styles.message}>Delete this course, its materials, quizzes, assignments, and enrolments?</Text>
              <View style={styles.actionRow}>
                <Pressable style={styles.dangerAction} onPress={handleDeleteCourse} disabled={saving}>
                  <Text style={styles.dangerButtonText}>{saving ? 'Deleting...' : 'Yes, delete'}</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => setConfirmDelete(false)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {!isManager && user?.role === 'student' && !isEnrolled ? (
        <CourseEnrollmentPanel isEnrolled={false} saving={saving} onEnrol={handleEnrol} />
      ) : null}

      {isEnrolled && user?.role === 'student' ? (
        <CourseEnrollmentPanel isEnrolled saving={saving} onLeave={handleLeave} />
      ) : null}

      {isEnrolled || isManager ? (
        <View>
          <View style={styles.courseCard}>
            <Text style={styles.sectionTitle}>Quizzes</Text>
            <Text style={styles.courseDescription}>
              Take published quizzes or manage the quizzes for this course.
            </Text>
            <Link href={`/course-quizzes/${courseId}`} asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Open quizzes</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.courseCard}>
            <Text style={styles.sectionTitle}>Assignments</Text>
            <Text style={styles.courseDescription}>
              View deadlines, submit your work, or grade student submissions.
            </Text>
            <Link href={`/course-assignments/${courseId}`} asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Open assignments</Text>
              </Pressable>
            </Link>
          </View>

          <CourseMaterialsSection courseId={courseId} isManager={isManager} />
        </View>
      ) : null}

      {isManager ? (
        <EnrolledStudentsList students={students} error={studentsError} />
      ) : null}
    </KeyboardForm>
  );
}
