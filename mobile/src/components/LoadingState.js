import { ActivityIndicator, Text, View } from 'react-native';
import styles from '../styles';

export default function LoadingState({ message }) {
  return (
    <View accessibilityRole="progressbar" style={styles.page}>
      <ActivityIndicator size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
