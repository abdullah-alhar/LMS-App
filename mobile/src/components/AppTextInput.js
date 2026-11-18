import { TextInput } from 'react-native';
import styles from '../styles';

export default function AppTextInput({ accessibilityLabel, style, ...props }) {
  return (
    <TextInput
      {...props}
      accessibilityLabel={accessibilityLabel || props.placeholder}
      style={[styles.input, style]}
    />
  );
}
