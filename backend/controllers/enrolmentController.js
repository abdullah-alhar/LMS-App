const Course = require('../models/Course');
const Enrolment = require('../models/Enrolment');
const { canManage } = require('../utils/permissions');

//student joins a course with the key (post /:id/enrol)
const enrol = async (req, res) => {
    const { enrolKey } = req.body || {};

    //the key is hidden (select: false), so ask for it here only to compare
    const course = await Course.findById(req.params.id).select('+enrolKey');
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }
    if (!course.enrolKey) {
        return res.status(400).json({ message: 'This course is not open for enrolment' });
    }
    if (enrolKey !== course.enrolKey) {
        return res.status(403).json({ message: 'Wrong enrol key' });
    }

    //friendly message here; the unique index is the safety net for double clicks
    const already = await Enrolment.findOne({ student: req.user._id, course: course._id });
    if (already) {
        return res.status(409).json({ message: 'You are already enrolled in this course' });
    }

    //the student is always the logged in user, never from the body
    const enrolment = await Enrolment.create({ student: req.user._id, course: course._id });
    res.status(201).json({ message: 'Enrolled successfully', enrolment });
};

//student leaves a course (delete /:id/enrol)
const unenrol = async (req, res) => {
    const enrolment = await Enrolment.findOneAndDelete({
        student: req.user._id,
        course: req.params.id,
    });
    if (!enrolment) {
        return res.status(404).json({ message: 'You are not enrolled in this course' });
    }
    res.status(200).json({ message: 'Left the course' });
};

//owner lecturer (or admin) sees who joined (get /:id/students)
const getCourseStudents = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }
    if (!canManage(course, req.user)) {
        return res.status(403).json({ message: 'Only the course lecturer can see students' });
    }

    const enrolments = await Enrolment.find({ course: course._id })
        .populate('student', 'name email')
        .sort({ createdAt: 1 }); //first to join comes first

    res.status(200).json(enrolments);
};

//a student's own courses (get /my)
const getMyCourses = async (req, res) => {
    //nested populate: enrolment → course → that course's lecturer
    const enrolments = await Enrolment.find({ student: req.user._id }).populate({
        path: 'course',
        populate: { path: 'lecturer', select: 'name' },
    });

    //keep only the courses; skip any whose course was deleted (populate gives null)
    res.status(200).json(enrolments.map((e) => e.course).filter(Boolean));
};

module.exports = { enrol, unenrol, getCourseStudents, getMyCourses };
