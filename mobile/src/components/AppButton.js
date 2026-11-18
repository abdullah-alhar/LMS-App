import { ActivityIndicator, Pressable } from 'react-native';
import styles from '../styles';

export default function AppButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[styles.button, (disabled || loading) && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : children}
    </Pressable>
  );
}
