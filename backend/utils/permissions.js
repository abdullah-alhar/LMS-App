//can this user manage (edit/delete/see students of) this course?
//admin, or the lecturer who owns it
//.equals() compares the ObjectId values; === would compare objects and always be false
const canManage = (course, user) =>
    user.role === 'admin' || course.lecturer.equals(user._id);

module.exports = { canManage };
