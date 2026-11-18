import { StyleSheet } from 'react-native';
import { colors } from './theme';

export default StyleSheet.create({
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  quizHeaderText: {
    flex: 1,
  },
  quizStatus: {
    marginTop: 10,
    color: colors.statusText,
    fontWeight: '600',
  },
  quizScore: {
    marginTop: 8,
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  correctResult: {
    marginTop: 8,
    color: colors.success,
    fontWeight: '700',
  },
  incorrectResult: {
    marginTop: 8,
    color: colors.danger,
    fontWeight: '700',
  },
  quizHint: {
    marginTop: 12,
    marginBottom: 8,
    color: colors.mutedText,
    lineHeight: 20,
  },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  timerTitle: {
    flex: 1,
    marginRight: 12,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondaryText,
  },
  timerUrgent: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.danger,
  },
  answerOption: {
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d3dbe7',
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  answerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  answerOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  optionEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correctOptionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#aab5c5',
    borderRadius: 22,
  },
  correctOptionSelected: {
    borderColor: colors.success,
    backgroundColor: colors.successSurface,
  },
  correctOptionText: {
    color: colors.secondaryText,
    fontWeight: '700',
  },
  optionInput: {
    flex: 1,
  },
  marksInput: {
    marginTop: 8,
  },
});
