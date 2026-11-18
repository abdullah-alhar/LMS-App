const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { canManage, canView } = require('../utils/permissions');

const getCourseForUser = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) return { response: { status: 404, message: 'Course not found' } };
  if (!(await canView(course, user))) {
    return { response: { status: 403, message: 'Enrol in this course to view assignments' } };
  }
  return { course };
};

const createAssignment = async (req, res) => {
  const { course, response } = await getCourseForUser(req.params.id, req.user);
  if (response) return res.status(response.status).json({ message: response.message });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can create assignments' });
  }
  const { title, instructions, dueDate, maxMarks } = req.body || {};
  const assignment = await Assignment.create({
    course: course._id,
    title,
    instructions,
    dueDate,
    maxMarks,
    createdBy: req.user._id,
  });
  res.status(201).json(assignment);
};

const getAssignments = async (req, res) => {
  const { course, response } = await getCourseForUser(req.params.id, req.user);
  if (response) return res.status(response.status).json({ message: response.message });
  const assignments = await Assignment.find({ course: course._id }).sort({ dueDate: 1 });
  if (req.user.role !== 'student') return res.status(200).json(assignments);

  const submissions = await AssignmentSubmission.find({
    course: course._id,
    student: req.user._id,
  });
  const byAssignment = new Map(submissions.map((item) => [String(item.assignment), item]));
  res.status(200).json(assignments.map((item) => ({
    ...item.toObject(),
    mySubmission: byAssignment.get(String(item._id)) || null,
  })));
};

const getAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  if (!(await canView(assignment.course, req.user))) {
    return res.status(403).json({ message: 'Enrol in this course to view this assignment' });
  }
  res.status(200).json(assignment);
};

const updateAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  if (!canManage(assignment.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can edit assignments' });
  }
  const { title, instructions, dueDate, maxMarks } = req.body || {};
  if (title !== undefined) assignment.title = title;
  if (instructions !== undefined) assignment.instructions = instructions;
  if (dueDate !== undefined) assignment.dueDate = dueDate;
  if (maxMarks !== undefined) assignment.maxMarks = maxMarks;
  await assignment.save();
  res.status(200).json(assignment);
};

const deleteAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  if (!canManage(assignment.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can delete assignments' });
  }
  const submissions = await AssignmentSubmission.find({ assignment: assignment._id });
  for (const submission of submissions) {
    if (submission.publicId) {
      await cloudinary.uploader.destroy(submission.publicId, { resource_type: 'raw' });
    }
  }
  await AssignmentSubmission.deleteMany({ assignment: assignment._id });
  await assignment.deleteOne();
  res.status(200).json({ message: 'Assignment deleted' });
};

const submitAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  const course = await Course.findById(assignment.course);
  if (!(await canView(course, req.user)) || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only enrolled students can submit this assignment' });
  }
  if (Date.now() > assignment.dueDate.getTime()) {
    return res.status(400).json({ message: 'The due date has passed' });
  }
  const { text } = req.body || {};
  if ((!text || !text.trim()) && !req.file) {
    return res.status(400).json({ message: 'Write an answer or attach a file' });
  }

  const existing = await AssignmentSubmission.findOne({
    assignment: assignment._id,
    student: req.user._id,
  });
  const changes = { text: text?.trim() || '' };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, `lms/${course.code}/submissions`);
    changes.fileUrl = result.secure_url;
    changes.publicId = result.public_id;
    changes.fileName = req.file.originalname;
  }

  if (existing) {
    const replacingFile = Boolean(req.file) || Boolean(changes.text && existing.publicId);
    if (replacingFile && existing.publicId) {
      await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'raw' });
    }
    if (req.file) {
      Object.assign(existing, changes);
    } else if (changes.text && existing.publicId) {
      existing.text = changes.text;
      existing.fileUrl = undefined;
      existing.publicId = undefined;
      existing.fileName = undefined;
    } else {
      existing.text = changes.text;
    }
    Object.assign(existing, { submittedAt: new Date(), grade: undefined, feedback: '', gradedBy: undefined, gradedAt: undefined });
    await existing.save();
    return res.status(200).json(existing);
  }

  const submission = await AssignmentSubmission.create({
    assignment: assignment._id,
    course: course._id,
    student: req.user._id,
    ...changes,
  });
  res.status(201).json(submission);
};

const getMySubmission = async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  const course = await Course.findById(assignment.course);
  if (!(await canView(course, req.user)) || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only enrolled students can view this submission' });
  }
  const submission = await AssignmentSubmission.findOne({ assignment: assignment._id, student: req.user._id });
  if (!submission) return res.status(404).json({ message: 'No submission yet' });
  res.status(200).json(submission);
};

const getSubmissions = async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  if (!canManage(assignment.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can view submissions' });
  }
  const submissions = await AssignmentSubmission.find({ assignment: assignment._id })
    .populate('student', 'name email')
    .sort({ submittedAt: 1 });
  res.status(200).json(submissions);
};

const gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body || {};
  const submission = await AssignmentSubmission.findById(req.params.submissionId).populate({
    path: 'assignment',
    populate: { path: 'course' },
  });
  if (!submission) return res.status(404).json({ message: 'Submission not found' });
  const assignment = submission.assignment;
  if (!canManage(assignment.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can grade submissions' });
  }
  if (!Number.isFinite(Number(grade)) || Number(grade) < 0 || Number(grade) > assignment.maxMarks) {
    return res.status(400).json({ message: `Grade must be between 0 and ${assignment.maxMarks}` });
  }
  submission.grade = Number(grade);
  submission.feedback = feedback || '';
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();
  await submission.save();
  res.status(200).json(submission);
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
};
