import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import AppButton from '../../../components/AppButton';
import { DOCUMENT_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from '../../../constants/documentTypes';
import { addCourseMaterial, deleteCourseMaterial, getCourseMaterials } from '../../../services/courseService';
import getErrorMessage from '../../../utils/getErrorMessage';
import styles from '../../../styles';

const MATERIAL_TYPES = ['link', 'video', 'file'];

export default function CourseMaterialsSection({ courseId, isManager }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materialType, setMaterialType] = useState('link');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCourseMaterials(courseId);
      setMaterials(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load materials'));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getCourseMaterials(courseId);
        if (isCurrent) setMaterials(response.data);
      } catch (requestError) {
        if (isCurrent) setError(getErrorMessage(requestError, 'Could not load materials'));
      } finally {
        if (isCurrent) setLoading(false);
      }
    };
    load();
    return () => { isCurrent = false; };
  }, [courseId]);

  const chooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: DOCUMENT_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
          setMessage(`Choose a file no larger than ${MAX_UPLOAD_SIZE_MB} MB.`);
          return;
        }
        setSelectedFile(file);
      }
    } catch (pickerError) {
      setMessage(getErrorMessage(pickerError, 'Could not open the file picker'));
    }
  };

  const addMaterial = async () => {
    setMessage('');
    if (!materialTitle.trim()) return setMessage('Enter a title for this material.');
    if (materialType === 'file' && !selectedFile) return setMessage('Choose a PDF, Word, or PowerPoint file.');
    if (materialType !== 'file' && !materialUrl.trim()) return setMessage('Enter the video or link URL.');

    setSaving(true);
    try {
      let payload;
      if (materialType === 'file') {
        payload = new FormData();
        payload.append('title', materialTitle.trim());
        payload.append('type', 'file');
        payload.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream',
        });
      } else {
        payload = { title: materialTitle.trim(), type: materialType, url: materialUrl.trim() };
      }
      await addCourseMaterial(courseId, payload);
      setMaterialTitle('');
      setMaterialUrl('');
      setSelectedFile(null);
      setMessage('Material added.');
      await loadMaterials();
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not add material'));
    } finally {
      setSaving(false);
    }
  };

  const removeMaterial = async (materialId) => {
    setDeletingId(materialId);
    setMessage('');
    try {
      await deleteCourseMaterial(courseId, materialId);
      setMaterials((current) => current.filter((material) => material._id !== materialId));
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, 'Could not delete material'));
    } finally {
      setDeletingId('');
    }
  };

  const openMaterial = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (openError) {
      setMessage(getErrorMessage(openError, 'Could not open this material'));
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Materials</Text>
      {loading ? <Text style={styles.message}>Loading materials...</Text> : null}
      {error ? (
        <View>
          <Text style={styles.message}>{error}</Text>
          <Pressable accessibilityRole="button" style={styles.button} onPress={loadMaterials}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {!loading && !error && materials.length === 0 ? (
        <Text style={styles.message}>No materials have been added yet.</Text>
      ) : null}
      {materials.map((material) => (
        <View key={material._id} style={styles.materialCard}>
          <Text style={styles.materialType}>{material.type.toUpperCase()}</Text>
          <Text style={styles.courseTitle}>{material.title}</Text>
          {material.fileName ? <Text style={styles.courseLecturer}>{material.fileName}</Text> : null}
          <Pressable accessibilityRole="link" style={styles.textButton} onPress={() => openMaterial(material.url)}>
            <Text style={styles.textButtonLabel}>Open material</Text>
          </Pressable>
          {isManager ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${material.title}`}
              style={styles.secondaryAction}
              onPress={() => removeMaterial(material._id)}
              disabled={deletingId === material._id}
            >
              <Text style={styles.dangerButtonText}>
                {deletingId === material._id ? 'Removing...' : 'Remove material'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      {isManager ? (
        <View style={styles.courseCard}>
          <Text style={styles.sectionTitle}>Add material</Text>
          <TextInput
            accessibilityLabel="Material title"
            style={styles.input}
            placeholder="Material title"
            value={materialTitle}
            onChangeText={setMaterialTitle}
          />
          <View style={styles.roleRow}>
            {MATERIAL_TYPES.map((type) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: materialType === type }}
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
              <Pressable accessibilityRole="button" style={styles.secondaryAction} onPress={chooseFile}>
                <Text style={styles.secondaryButtonText}>Choose PDF, Word, or PowerPoint</Text>
              </Pressable>
              {selectedFile ? <Text style={styles.message}>{selectedFile.name}</Text> : null}
              <Text style={styles.courseLecturer}>Maximum file size: {MAX_UPLOAD_SIZE_MB} MB</Text>
            </View>
          ) : (
            <TextInput
              accessibilityLabel={materialType === 'video' ? 'YouTube URL' : 'Material URL'}
              style={styles.input}
              placeholder={materialType === 'video' ? 'YouTube URL' : 'https://...'}
              value={materialUrl}
              onChangeText={setMaterialUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          <AppButton onPress={addMaterial} loading={saving}>
            <Text style={styles.buttonText}>Add material</Text>
          </AppButton>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
