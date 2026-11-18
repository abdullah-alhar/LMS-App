import api from './httpClient';

export const getCourseAssignments = (courseId) => api.get(`/courses/${courseId}/assignments`);
export const createAssignment = (courseId, assignment) =>
  api.post(`/courses/${courseId}/assignments`, assignment);
export const deleteAssignment = (assignmentId) => api.delete(`/assignments/${assignmentId}`);
export const getAssignmentSubmissions = (assignmentId) =>
  api.get(`/assignments/${assignmentId}/submissions`);
export const submitAssignment = (assignmentId, submission) =>
  api.post(`/assignments/${assignmentId}/submit`, submission);
export const gradeAssignmentSubmission = (submissionId, grade) =>
  api.patch(`/assignments/submissions/${submissionId}/grade`, grade);
