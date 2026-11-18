import { Pressable, Text, View } from 'react-native';
import styles from '../styles';

export default function ErrorState({ title, message, onRetry, children }) {
  return (
    <View style={styles.page}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text accessibilityRole="alert" style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={styles.button}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
      {children}
    </View>
  );
}
