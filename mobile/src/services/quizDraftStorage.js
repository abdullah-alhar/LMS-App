import * as SecureStore from 'expo-secure-store';

const draftKey = (quizId) => `quiz-draft:${quizId}`;

export const getQuizDraft = async (quizId, questionCount) => {
  try {
    const savedDraft = await SecureStore.getItemAsync(draftKey(quizId));
    if (!savedDraft) return null;

    const answers = JSON.parse(savedDraft);
    if (!Array.isArray(answers) || answers.length !== questionCount) return null;
    return answers;
  } catch {
    return null;
  }
};

export const saveQuizDraft = async (quizId, answers) => {
  try {
    await SecureStore.setItemAsync(draftKey(quizId), JSON.stringify(answers));
  } catch {
    // Keep the active quiz usable if local storage is unavailable.
  }
};

export const clearQuizDraft = async (quizId) => {
  try {
    await SecureStore.deleteItemAsync(draftKey(quizId));
  } catch {
    // A finished attempt can still be shown if local cleanup fails.
  }
};
