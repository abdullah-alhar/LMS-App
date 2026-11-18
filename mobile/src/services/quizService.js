import api from './httpClient';

export const getCourseQuizzes = (courseId) => api.get(`/courses/${courseId}/quizzes`);
export const createQuiz = (courseId, quiz) => api.post(`/courses/${courseId}/quizzes`, quiz);
export const getQuiz = (quizId) => api.get(`/quizzes/${quizId}`);
export const updateQuiz = (quizId, changes) => api.patch(`/quizzes/${quizId}`, changes);
export const deleteQuiz = (quizId) => api.delete(`/quizzes/${quizId}`);
export const setQuizPublished = (quizId, isPublished) =>
  api.patch(`/quizzes/${quizId}/publish`, { isPublished });
export const startQuiz = (quizId) => api.post(`/quizzes/${quizId}/start`);
export const getMyQuizAttempt = (quizId) => api.get(`/quizzes/${quizId}/my-attempt`);
export const submitQuiz = (quizId, answers) =>
  api.post(`/quizzes/${quizId}/submit`, { answers });
export const getQuizAttempts = (quizId) => api.get(`/quizzes/${quizId}/attempts`);
