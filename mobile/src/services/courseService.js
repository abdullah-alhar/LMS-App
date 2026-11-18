import api from './httpClient';

export const getCourses = () => api.get('/courses');
export const getMyCourses = () => api.get('/courses/my');
export const getCourse = (courseId) => api.get(`/courses/${courseId}`);
export const createCourse = (course) => api.post('/courses', course);
export const updateCourse = (courseId, changes) => api.patch(`/courses/${courseId}`, changes);
export const deleteCourse = (courseId) => api.delete(`/courses/${courseId}`);
export const enrolInCourse = (courseId, enrolKey) =>
  api.post(`/courses/${courseId}/enrol`, { enrolKey });
export const leaveCourse = (courseId) => api.delete(`/courses/${courseId}/enrol`);
export const getCourseStudents = (courseId) => api.get(`/courses/${courseId}/students`);
export const getCourseMaterials = (courseId) => api.get(`/courses/${courseId}/materials`);
export const addCourseMaterial = (courseId, material) =>
  api.post(`/courses/${courseId}/materials`, material);
export const deleteCourseMaterial = (courseId, materialId) =>
  api.delete(`/courses/${courseId}/materials/${materialId}`);
