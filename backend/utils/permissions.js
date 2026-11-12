const Enrolment = require('../models/Enrolment');

//can this user manage (edit/delete/see students of) this course?
//admin, or the lecturer who owns it
//.equals() compares the ObjectId values; === would compare objects and always be false
const canManage = (course, user) =>
    user.role === 'admin' || course.lecturer.equals(user._id);

// Can this user SEE this course's content?
const canView = async (course, user) => {
  if (canManage(course, user)) return true;   // owner lecturer or admin
  const enrolled = await Enrolment.exists({ student: user._id, course: course._id });
  return Boolean(enrolled);
};

module.exports = { canManage, canView };