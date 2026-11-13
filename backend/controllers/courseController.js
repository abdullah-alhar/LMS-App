const Course = require('../models/Course');
const Enrolment = require('../models/Enrolment');
const Material = require('../models/Material');
const Quiz = require('../models/Quiz');
const cloudinary = require('../config/cloudinary');
const { canManage } = require('../utils/permissions');

//lecturer can create a course (post)
const createCourse = async (req, res) => {
    const { title, code, description, enrolKey } = req.body || {};

    const course = await Course.create({
        title,
        code,
        description,
        enrolKey,
        lecturer: req.user._id, //always the logged in lecturer
    });
    res.status(201).json(course);
};

//everyone can view all course (get)
const getCourses = async (req, res) => {
    const courses = await Course.find()
        .populate('lecturer', 'name email')
        .sort({ createdAt: -1 }); //sort by newest first

    res.status(200).json(courses);
}

//everyone can view one course (get /:id)
//a bad id like "abc" throws a CastError → errorHandler sends 400 "Invalid id"
const getCourse = async (req, res) => {
    const course = await Course.findById(req.params.id).populate('lecturer', 'name email');

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
};

//owner lecturer or admin can edit a course (patch /:id)
const updateCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    //check order: exists? (404) → yours? (403) → then change it
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }
    if (!canManage(course, req.user)) {
        return res.status(403).json({ message: 'You can only edit your own courses' });
    }

    //only change the fields that were sent; "lecturer" is never taken from the body
    const { title, code, description, enrolKey } = req.body || {};
    if (title !== undefined) course.title = title;
    if (code !== undefined) course.code = code;
    if (description !== undefined) course.description = description;
    if (enrolKey !== undefined) course.enrolKey = enrolKey;

    await course.save(); //save() runs the model rules (required, maxlength, uppercase)
    res.status(200).json(course);
};

//owner lecturer or admin can delete a course (delete /:id)
const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }
    if (!canManage(course, req.user)) {
        return res.status(403).json({ message: 'You can only delete your own courses' });
    }

    // cascade delete: remove Cloudinary files, materials and enrolments so none are left orphaned
    const materials = await Material.find({ course: course._id });
    for (const m of materials) {
        if (m.publicId) await cloudinary.uploader.destroy(m.publicId, { resource_type: 'raw' });
    }
    await Material.deleteMany({ course: course._id });
    await Enrolment.deleteMany({ course: course._id });
    await Quiz.deleteMany({ course: course._id });
    await course.deleteOne();
    res.status(200).json({ message: 'Course deleted' });
};

module.exports = { createCourse, getCourses, getCourse, updateCourse, deleteCourse };