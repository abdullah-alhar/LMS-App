import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AppButton from '../../../components/AppButton';
import AppTextInput from '../../../components/AppTextInput';
import styles from '../../../styles';

export default function CourseEnrollmentPanel({ isEnrolled, saving, onEnrol, onLeave }) {
  const [enrolKey, setEnrolKey] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);

  if (!isEnrolled) {
    return (
      <View style={styles.courseCard}>
        <Text style={styles.sectionTitle}>Join this course</Text>
        <AppTextInput
          placeholder="Enrolment key"
          value={enrolKey}
          onChangeText={setEnrolKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <AppButton
          onPress={async () => {
            if (await onEnrol(enrolKey.trim())) setEnrolKey('');
          }}
          loading={saving}
        >
          <Text style={styles.buttonText}>Enrol</Text>
        </AppButton>
      </View>
    );
  }

  return (
    <View style={styles.courseCard}>
      {!confirmLeave ? (
        <Pressable accessibilityRole="button" style={styles.secondaryAction} onPress={() => setConfirmLeave(true)}>
          <Text style={styles.secondaryButtonText}>Leave course</Text>
        </Pressable>
      ) : (
        <View>
          <Text style={styles.message}>Leave course? You will lose access to its materials.</Text>
          <View style={styles.actionRow}>
            <AppButton
              style={styles.dangerAction}
              onPress={async () => {
                if (await onLeave()) setConfirmLeave(false);
              }}
              loading={saving}
            >
              <Text style={styles.dangerButtonText}>Yes, leave</Text>
            </AppButton>
            <Pressable accessibilityRole="button" style={styles.secondaryAction} onPress={() => setConfirmLeave(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
