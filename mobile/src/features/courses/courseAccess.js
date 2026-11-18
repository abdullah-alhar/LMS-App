export const isCourseManager = (course, user) => {
  if (!course || !user) return false;
  if (user.role === 'admin') return true;
  const lecturerId = course.lecturer?._id || course.lecturer;
  return String(lecturerId) === String(user._id);
};
