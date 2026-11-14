const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const { canManage, canView } = require('../utils/permissions');
const QuizAttempt = require('../models/QuizAttempt');

// Remove correct answers before sending a quiz to a student
const hideAnswers = (quiz) => {
  const data = quiz.toObject();
  data.questions = data.questions.map(({ correctIndex, ...rest }) => rest);
  return data;
};

const findQuiz = (id) => Quiz.findById(id).populate('course');

// POST /api/courses/:id/quizzes
const createQuiz = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can create quizzes' });
  }

  const { title, timeLimit, questions } = req.body || {};
  const quiz = await Quiz.create({
    course: course._id,
    title,
    timeLimit,
    questions,
    createdBy: req.user._id,
  });
  res.status(201).json(quiz);
};

// GET /api/courses/:id/quizzes
const getQuizzes = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!(await canView(course, req.user))) {
    return res.status(403).json({ message: 'Enrol in this course to see its quizzes' });
  }

  const filter = { course: course._id };
  if (!canManage(course, req.user)) filter.isPublished = true; // students: published only

  const quizzes = await Quiz.find(filter)
    .select('title timeLimit isPublished createdAt')
    .sort({ createdAt: -1 });
  res.status(200).json(quizzes);
};

// GET /api/quizzes/:quizId
const getQuiz = async (req, res) => {
  const quiz = await findQuiz(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!(await canView(quiz.course, req.user))) {
    return res.status(403).json({ message: 'Enrol in this course to see this quiz' });
  }

  if (canManage(quiz.course, req.user)) return res.status(200).json(quiz);

  if (!quiz.isPublished) return res.status(404).json({ message: 'Quiz not found' });
  res.status(200).json(hideAnswers(quiz));
};

// PATCH /api/quizzes/:quizId
const updateQuiz = async (req, res) => {
  const quiz = await findQuiz(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!canManage(quiz.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can edit this quiz' });
  }
  if (quiz.isPublished) {
    return res.status(400).json({ message: 'Unpublish the quiz before editing it' });
  }
  if (await QuizAttempt.exists({ quiz: quiz._id })) {
    return res.status(400).json({ message: 'This quiz already has attempts and cannot be edited' });
  }

  const { title, timeLimit, questions } = req.body || {};
  if (title !== undefined) quiz.title = title;
  if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
  if (questions !== undefined) quiz.questions = questions;

  await quiz.save();
  res.status(200).json(quiz);
};

// PATCH /api/quizzes/:quizId/publish   body: { "isPublished": true }
const setPublished = async (req, res) => {
  const quiz = await findQuiz(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!canManage(quiz.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can publish this quiz' });
  }

  const { isPublished } = req.body || {};
  if (typeof isPublished !== 'boolean') {
    return res.status(400).json({ message: 'isPublished must be true or false' });
  }

  quiz.isPublished = isPublished;
  await quiz.save();
  res.status(200).json({ message: isPublished ? 'Quiz published' : 'Quiz unpublished' });
};

// DELETE /api/quizzes/:quizId
const deleteQuiz = async (req, res) => {
  const quiz = await findQuiz(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!canManage(quiz.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can delete this quiz' });
  }

  await QuizAttempt.deleteMany({ quiz: quiz._id });
  await quiz.deleteOne();
  res.status(200).json({ message: 'Quiz deleted' });
};

module.exports = { createQuiz, getQuizzes, getQuiz, updateQuiz, setPublished, deleteQuiz, hideAnswers };