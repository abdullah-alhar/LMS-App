import { Text, View } from 'react-native';
import styles from '../../../styles';

export default function EnrolledStudentsList({ students, error }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Enrolled students</Text>
      {error ? <Text style={styles.message}>{error}</Text> : null}
      {students.length === 0 && !error ? (
        <Text style={styles.message}>No students have enrolled yet.</Text>
      ) : null}
      {students.map((enrolment) => (
        <View key={enrolment._id} style={styles.studentRow}>
          <Text style={styles.courseTitle}>{enrolment.student?.name || 'Student'}</Text>
          <Text style={styles.courseLecturer}>{enrolment.student?.email}</Text>
        </View>
      ))}
    </View>
  );
}
