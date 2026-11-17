import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import api from '../../api/client';
import styles from '../../styles/authStyles';

const fileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const courseId = Array.isArray(id) ? id[0] : id;
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materialsError, setMaterialsError] = useState('');
  const [studentsError, setStudentsError] = useState('');
  const [enrolKey, setEnrolKey] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newEnrolKey, setNewEnrolKey] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [materialType, setMaterialType] = useState('link');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [materialMessage, setMaterialMessage] = useState('');
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [deletingMaterialId, setDeletingMaterialId] = useState('');

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError('');
    setMaterialsError('');
    setStudentsError('');

    try {
      const [courseResponse, userResponse] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get('/auth/me'),
      ]);
      const loadedCourse = courseResponse.data;
      const loadedUser = userResponse.data;
      const lecturerId = loadedCourse.lecturer?._id || loadedCourse.lecturer;
      const canManageCourse =
        loadedUser.role === 'admin' || String(lecturerId) === String(loadedUser._id);

      setCourse(loadedCourse);
      setUser(loadedUser);
      setEditTitle(loadedCourse.title || '');
      setEditCode(loadedCourse.code || '');
      setEditDescription(loadedCourse.description || '');
      setIsManager(canManageCourse);

      let enrolled = canManageCourse;
      if (loadedUser.role === 'student') {
        const myCoursesResponse = await api.get('/courses/my');
        enrolled = myCoursesResponse.data.some(
          (item) => String(item._id) === String(courseId)
        );
      }
      setIsEnrolled(enrolled);

      if (enrolled || canManageCourse) {
        try {
          const materialsResponse = await api.get(`/courses/${courseId}/materials`);
          setMaterials(materialsResponse.data);
        } catch (materialsRequestError) {
          setMaterialsError(
            materialsRequestError.response?.data?.message ||
              `Could not load materials: ${materialsRequestError.message}`
          );
        }
      } else {
        setMaterials([]);
      }

      if (canManageCourse) {
        try {
          const studentsResponse = await api.get(`/courses/${courseId}/students`);
          setStudents(studentsResponse.data);
        } catch (studentsRequestError) {
          setStudentsError(
            studentsRequestError.response?.data?.message ||
              `Could not load students: ${studentsRequestError.message}`
          );
        }
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        await SecureStore.deleteItemAsync('token');
        router.replace('/');
      } else {
        setError(
          requestError.response?.data?.message ||
            `Could not load course: ${requestError.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const timeout = setTimeout(() => loadCourse(), 0);
    return () => clearTimeout(timeout);
  }, [loadCourse]);

  const handleEnrol = async () => {
    setMessage('');
    setSaving(true);
    try {
      const response = await api.post(`/courses/${courseId}/enrol`, {
        enrolKey: enrolKey.trim(),
      });
      setIsEnrolled(true);
      setEnrolKey('');
      setMessage(response.data.message);
      const materialsResponse = await api.get(`/courses/${courseId}/materials`);
      setMaterials(materialsResponse.data);
      setMaterialsError('');
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          `Could not enrol: ${requestError.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    setSaving(true);
    try {
      const response = await api.delete(`/courses/${courseId}/enrol`);
      setIsEnrolled(false);
      setMaterials([]);
      setConfirmLeave(false);
      setMessage(response.data.message);
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          `Could not leave course: ${requestError.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCourse = async () => {
    setMessage('');
    setSaving(true);
    const changes = {
      title: editTitle.trim(),
      code: editCode.trim().toUpperCase(),
      description: editDescription.trim(),
    };
    if (newEnrolKey.trim()) changes.enrolKey = newEnrolKey.trim();

    try {
      await api.patch(`/courses/${courseId}`, changes);
      setCourse((current) => ({ ...current, ...changes }));
      setNewEnrolKey('');
      setEditMode(false);
      setMessage('Course updated.');
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          `Could not update course: ${requestError.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    setSaving(true);
    try {
      await api.delete(`/courses/${courseId}`);
      router.replace('/home');
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          `Could not delete course: ${requestError.message}`
      );
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  const chooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: fileTypes,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setSelectedFile(result.assets[0]);
  };

  const handleAddMaterial = async () => {
    setMaterialMessage('');
    if (!materialTitle.trim()) {
      setMaterialMessage('Enter a title for this material.');
      return;
    }
    if (materialType === 'file' && !selectedFile) {
      setMaterialMessage('Choose a PDF, Word, or PowerPoint file.');
      return;
    }
    if (materialType !== 'file' && !materialUrl.trim()) {
      setMaterialMessage('Enter the video or link URL.');
      return;
    }

    setSavingMaterial(true);
    try {
      let requestBody;
      if (materialType === 'file') {
        requestBody = new FormData();
        requestBody.append('title', materialTitle.trim());
        requestBody.append('type', 'file');
        requestBody.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream',
        });
      } else {
        requestBody = {
          title: materialTitle.trim(),
          type: materialType,
          url: materialUrl.trim(),
        };
      }

      await api.post(`/courses/${courseId}/materials`, requestBody);
      const materialsResponse = await api.get(`/courses/${courseId}/materials`);
      setMaterials(materialsResponse.data);
      setMaterialTitle('');
      setMaterialUrl('');
      setSelectedFile(null);
      setMaterialMessage('Material added.');
    } catch (requestError) {
      setMaterialMessage(
        requestError.response?.data?.message ||
          `Could not add material: ${requestError.message}`
      );
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    setDeletingMaterialId(materialId);
    setMaterialMessage('');
    try {
      await api.delete(`/courses/${courseId}/materials/${materialId}`);
      setMaterials((current) => current.filter((item) => item._id !== materialId));
    } catch (requestError) {
      setMaterialMessage(
        requestError.response?.data?.message ||
          `Could not delete material: ${requestError.message}`
      );
    } finally {
      setDeletingMaterialId('');
    }
  };

  const openMaterial = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (requestError) {
      setMaterialMessage(`Could not open this material: ${requestError.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading course...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.page}>
        <Text style={styles.message}>{error || 'Course not found.'}</Text>
        <Pressable style={styles.button} onPress={loadCourse}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
        <Link href="/home" style={styles.secondaryButtonText}>Back to courses</Link>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailPage}>
      <Link href="/home" style={styles.textButtonLabel}>‹ Back to courses</Link>

      {editMode ? (
        <View style={styles.courseCard}>
          <Text style={styles.sectionTitle}>Edit course</Text>
          <TextInput style={styles.input} placeholder="Course title" value={editTitle} onChangeText={setEditTitle} />
          <TextInput style={styles.input} placeholder="Course code" value={editCode} onChangeText={setEditCode} autoCapitalize="characters" />
          <TextInput style={[styles.input, styles.multilineInput]} placeholder="Description" value={editDescription} onChangeText={setEditDescription} multiline />
          <TextInput style={styles.input} placeholder="New enrolment key (optional)" value={newEnrolKey} onChangeText={setNewEnrolKey} autoCapitalize="none" />
          <Pressable style={styles.button} onPress={handleSaveCourse} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save changes'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setEditMode(false)}>
            <Text style={styles.secondaryButtonText}>Cancel editing</Text>
          </Pressable>
        </View>
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
              <Text style={styles.message}>Delete this course and its materials and enrolments?</Text>
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
        <View style={styles.courseCard}>
          <Text style={styles.sectionTitle}>Join this course</Text>
          <TextInput
            style={styles.input}
            placeholder="Enrolment key"
            value={enrolKey}
            onChangeText={setEnrolKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable style={styles.button} onPress={handleEnrol} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Joining...' : 'Enrol'}</Text>
          </Pressable>
        </View>
      ) : null}

      {isEnrolled && user?.role === 'student' ? (
        <View style={styles.courseCard}>
          {!confirmLeave ? (
            <Pressable style={styles.secondaryAction} onPress={() => setConfirmLeave(true)}>
              <Text style={styles.secondaryButtonText}>Leave course</Text>
            </Pressable>
          ) : (
            <View>
              <Text style={styles.message}>Leave this course? You will lose access to its materials.</Text>
              <View style={styles.actionRow}>
                <Pressable style={styles.dangerAction} onPress={handleLeave} disabled={saving}>
                  <Text style={styles.dangerButtonText}>{saving ? 'Leaving...' : 'Yes, leave'}</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => setConfirmLeave(false)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ) : null}

      {isEnrolled || isManager ? (
        <View>
          <Text style={styles.sectionTitle}>Materials</Text>
          {materialsError ? <Text style={styles.message}>{materialsError}</Text> : null}
          {materials.length === 0 && !materialsError ? (
            <Text style={styles.message}>No materials have been added yet.</Text>
          ) : null}
          {materials.map((material) => (
            <View key={material._id} style={styles.materialCard}>
              <Text style={styles.materialType}>{material.type.toUpperCase()}</Text>
              <Text style={styles.courseTitle}>{material.title}</Text>
              {material.fileName ? <Text style={styles.courseLecturer}>{material.fileName}</Text> : null}
              <Pressable style={styles.textButton} onPress={() => openMaterial(material.url)}>
                <Text style={styles.textButtonLabel}>Open material</Text>
              </Pressable>
              {isManager ? (
                <Pressable
                  style={styles.secondaryAction}
                  onPress={() => handleDeleteMaterial(material._id)}
                  disabled={deletingMaterialId === material._id}
                >
                  <Text style={styles.dangerButtonText}>
                    {deletingMaterialId === material._id ? 'Removing...' : 'Remove material'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}

          {isManager ? (
            <View style={styles.courseCard}>
              <Text style={styles.sectionTitle}>Add material</Text>
              <TextInput style={styles.input} placeholder="Material title" value={materialTitle} onChangeText={setMaterialTitle} />
              <View style={styles.roleRow}>
                {['link', 'video', 'file'].map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.roleButton, materialType === type && styles.roleButtonSelected]}
                    onPress={() => setMaterialType(type)}
                  >
                    <Text style={styles.roleButtonText}>{type[0].toUpperCase() + type.slice(1)}</Text>
                  </Pressable>
                ))}
              </View>
              {materialType === 'file' ? (
                <View>
                  <Pressable style={styles.secondaryAction} onPress={chooseFile}>
                    <Text style={styles.secondaryButtonText}>Choose PDF, Word, or PowerPoint</Text>
                  </Pressable>
                  {selectedFile ? <Text style={styles.message}>{selectedFile.name}</Text> : null}
                  <Text style={styles.courseLecturer}>Maximum file size: 10 MB</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={materialType === 'video' ? 'YouTube URL' : 'https://...'}
                  value={materialUrl}
                  onChangeText={setMaterialUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
              <Pressable style={styles.button} onPress={handleAddMaterial} disabled={savingMaterial}>
                {savingMaterial ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Add material</Text>
                )}
              </Pressable>
              {materialMessage ? <Text style={styles.message}>{materialMessage}</Text> : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {isManager ? (
        <View>
          <Text style={styles.sectionTitle}>Enrolled students</Text>
          {studentsError ? <Text style={styles.message}>{studentsError}</Text> : null}
          {students.length === 0 && !studentsError ? (
            <Text style={styles.message}>No students have enrolled yet.</Text>
          ) : null}
          {students.map((enrolment) => (
            <View key={enrolment._id} style={styles.studentRow}>
              <Text style={styles.courseTitle}>{enrolment.student?.name || 'Student'}</Text>
              <Text style={styles.courseLecturer}>{enrolment.student?.email}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
