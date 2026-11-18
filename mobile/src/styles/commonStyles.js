import { StyleSheet } from 'react-native';
import { colors } from './theme';

export default StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
  },
  title: {
    marginBottom: 8,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
    color: colors.mutedText,
  },
  input: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 16,
    padding: 12,
    minHeight: 44,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
  },
  roleButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  roleButtonText: {
    textAlign: 'center',
    color: '#333',
  },
  textButton: {
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  textButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  formPage: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.softSurface,
  },
  dangerAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dangerSurface,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.warningSurface,
  },
});
