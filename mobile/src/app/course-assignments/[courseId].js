import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import ErrorState from '../../components/ErrorState';
import KeyboardForm from '../../components/KeyboardForm';
import LoadingState from '../../components/LoadingState';
import AssignmentCreateForm from '../../features/assignments/components/AssignmentCreateForm';
import StudentSubmissionForm from '../../features/assignments/components/StudentSubmissionForm';
import SubmissionReviewCard from '../../features/assignments/components/SubmissionReviewCard';
import { isCourseManager } from '../../features/courses/courseAccess';
import { getCurrentUser } from '../../services/authService';
import { getCourse } from '../../services/courseService';
import {
  createAssignment as createAssignmentRequest,
  deleteAssignment as deleteAssignmentRequest,
  getAssignmentSubmissions,
  getCourseAssignments,
} from '../../services/assignmentService';
import getErrorMessage from '../../utils/getErrorMessage';
import getRouteParam from '../../utils/getRouteParam';
import styles from '../../styles';

export default function CourseAssignmentsScreen() {
  const { courseId: routeCourseId } = useLocalSearchParams();
  const courseId = getRouteParam(routeCourseId);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [expandedId, setExpandedId] = useState('');
  const [loadingSubmissionsId, setLoadingSubmissionsId] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAssignments = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const [courseResponse, userResponse, assignmentsResponse] = await Promise.all([
        getCourse(courseId),
        getCurrentUser(),
        getCourseAssignments(courseId),
      ]);
      setCourse(courseResponse.data);
      setUser(userResponse.data);
      setAssignments(assignmentsResponse.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load assignments'));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const timeout = setTimeout(loadAssignments, 0);
    return () => clearTimeout(timeout);
  }, [loadAssignments]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const isManager = isCourseManager(course, user);

  const createAssignment = async (assignment) => {
    setMessage('');
    setSaving(true);
    try {
      await createAssignmentRequest(courseId, assignment);
      setMessage('Assignment created.');
      await loadAssignments(false);
      return true;
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not create assignment'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const loadSubmissions = async (assignmentId, toggle = true) => {
    if (toggle && expandedId === assignmentId) {
      setExpandedId('');
      return;
    }
    setExpandedId(assignmentId);
    setLoadingSubmissionsId(assignmentId);
    setMessage('');
    try {
      const response = await getAssignmentSubmissions(assignmentId);
      setSubmissions((current) => ({ ...current, [assignmentId]: response.data }));
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not load submissions'));
    } finally {
      setLoadingSubmissionsId('');
    }
  };

  const deleteAssignment = async (assignmentId) => {
    setSaving(true);
    setMessage('');
    try {
      await deleteAssignmentRequest(assignmentId);
      setConfirmDeleteId('');
      setMessage('Assignment deleted.');
      await loadAssignments();
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not delete assignment'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading assignments..." />;
  }

  if (error) {
    return <ErrorState title="Assignments" message={error} onRetry={loadAssignments} />;
  }

  return (
    <KeyboardForm scrollStyle={styles.detailPage} contentContainerStyle={styles.assignmentContent}>
      <Link href={`/course/${courseId}`} style={styles.textButtonLabel}>‹ Back to course</Link>
      <Text style={styles.title}>Assignments</Text>
      <Text style={styles.courseDescription}>{course?.title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {isManager ? (
        <AssignmentCreateForm onCreate={createAssignment} saving={saving} />
      ) : null}

      {assignments.length === 0 ? <Text style={styles.message}>No assignments have been added yet.</Text> : null}
      {assignments.map((assignment) => {
        const submission = assignment.mySubmission;
        const deadlinePassed = currentTime > new Date(assignment.dueDate).getTime();
        return (
          <View key={assignment._id} style={styles.courseCard}>
            <Text style={styles.courseTitle}>{assignment.title}</Text>
            <Text style={styles.courseLecturer}>Due: {new Date(assignment.dueDate).toLocaleString()}</Text>
            <Text style={styles.courseLecturer}>Maximum marks: {assignment.maxMarks}</Text>
            {assignment.instructions ? <Text style={styles.courseDescription}>{assignment.instructions}</Text> : null}

            {isManager ? (
              <View>
                <Pressable style={styles.secondaryAction} onPress={() => loadSubmissions(assignment._id)}>
                  <Text style={styles.secondaryButtonText}>
                    {loadingSubmissionsId === assignment._id
                      ? 'Loading...'
                      : expandedId === assignment._id ? 'Hide submissions' : 'View submissions'}
                  </Text>
                </Pressable>
                {confirmDeleteId === assignment._id ? (
                  <View style={styles.confirmBox}>
                    <Text style={styles.message}>Delete this assignment and all student submissions?</Text>
                    <View style={styles.actionRow}>
                      <Pressable style={styles.dangerAction} onPress={() => deleteAssignment(assignment._id)} disabled={saving}>
                        <Text style={styles.dangerButtonText}>{saving ? 'Deleting...' : 'Yes, delete'}</Text>
                      </Pressable>
                      <Pressable style={styles.secondaryAction} onPress={() => setConfirmDeleteId('')}>
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable style={styles.secondaryAction} onPress={() => setConfirmDeleteId(assignment._id)}>
                    <Text style={styles.dangerButtonText}>Delete assignment</Text>
                  </Pressable>
                )}
                {expandedId === assignment._id && loadingSubmissionsId !== assignment._id && (submissions[assignment._id] || []).length === 0 ? <Text style={styles.message}>No submissions yet.</Text> : null}
                {expandedId === assignment._id ? (submissions[assignment._id] || []).map((item) => (
                  <SubmissionReviewCard
                    key={item._id}
                    submission={item}
                    assignment={assignment}
                    onGraded={() => loadSubmissions(assignment._id, false)}
                  />
                )) : null}
              </View>
            ) : (
              deadlinePassed ? (
                <View>
                  {submission ? <StudentSubmissionForm assignment={assignment} submission={submission} readOnly /> : null}
                  <Text style={styles.message}>The deadline has passed. Submissions are closed.</Text>
                </View>
              ) : (
                <StudentSubmissionForm assignment={assignment} submission={submission} onSubmitted={() => loadAssignments(false)} />
              )
            )}
          </View>
        );
      })}
    </KeyboardForm>
  );
}
