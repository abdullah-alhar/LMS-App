import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styles from '../styles';

export default function KeyboardForm({
  children,
  style,
  contentContainerStyle,
  scrollStyle,
}) {
  return (
    <KeyboardAvoidingView
      style={[styles.keyboardContainer, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={scrollStyle}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
