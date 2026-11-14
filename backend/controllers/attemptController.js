const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const {canManage, canView} = require('../utils/permissions');
const {hideAnswers} = require('./quizController');

const GRACE_MS = 30 * 1000; // 30 seconds grace period for submission after time limit

//when this attempt time run out 
const endTime = (attempt, quiz) => new Date(attempt.startedAt.getTime() + quiz.timeLimit * 60 * 1000);


const startQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate('course');
  if (!quiz || !quiz.isPublished) return res.status(404).json({ message: 'Quiz not found' });
  if (!(await canView(quiz.course, req.user))) {
    return res.status(403).json({ message: 'Enrol in this course to take this quiz' });
  }

  let attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user._id });
  if (attempt && attempt.status !== 'in-progress') {
    return res.status(409).json({ message: 'You have already taken this quiz' });
  }

  const isNew = !attempt;
  if (isNew) {
    const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
    attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      totalMarks,
    });
  }

  res.status(isNew ? 201 : 200).json({
    attemptId: attempt._id,
    startedAt: attempt.startedAt,
    endsAt: endTime(attempt, quiz),
    quiz: hideAnswers(quiz),
  });
};

// POST /api/quizzes/:quizId/submit  (student)   body: { "answers": [1, null, 2] }
const submitQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user._id });
  if (!attempt) return res.status(400).json({ message: 'Start the quiz first' });
  if (attempt.status !== 'in-progress') {
    return res.status(409).json({ message: 'You have already submitted this quiz' });
  }

  // 1) Time check (server time, not phone time)
  if (Date.now() > endTime(attempt, quiz).getTime() + GRACE_MS) {
    attempt.status = 'expired';
    attempt.submittedAt = new Date();
    await attempt.save();
    return res.status(400).json({ message: 'Time is up. Your answers were not accepted' });
  }

  // 2) Check the answers
  const { answers } = req.body || {};
  const count = quiz.questions.length;
  if (!Array.isArray(answers) || answers.length !== count) {
    return res
      .status(400)
      .json({ message: `Send ${count} answers (use null to skip a question)` });
  }
  for (let i = 0; i < count; i++) {
    const a = answers[i];
    if (a === null) continue;
    if (!Number.isInteger(a) || a < 0 || a >= quiz.questions[i].options.length) {
      return res.status(400).json({ message: `Answer ${i + 1} is not a valid option` });
    }
  }

  // 3) Mark it
  let score = 0;
  const review = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) score += q.marks;
    return {
      question: q.text,
      yourAnswer: answers[i],
      correctAnswer: q.correctIndex,
      isCorrect,
    };
  });

  // 4) Save
  attempt.answers = answers;
  attempt.score = score;
  attempt.status = 'submitted';
  attempt.submittedAt = new Date();
  await attempt.save();

  res.status(200).json({
    score,
    totalMarks: attempt.totalMarks,
    percentage: Math.round((score / attempt.totalMarks) * 100),
    review,
  });
};

// GET /api/quizzes/:quizId/my-attempt  (student)
const getMyAttempt = async (req, res) => {
  const attempt = await QuizAttempt.findOne({
    quiz: req.params.quizId,
    student: req.user._id,
  });
  if (!attempt) return res.status(404).json({ message: 'You have not taken this quiz' });
  res.status(200).json(attempt);
};

// GET /api/quizzes/:quizId/attempts  (owner lecturer / admin)
const getAttempts = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate('course');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!canManage(quiz.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can see the results' });
  }

  const attempts = await QuizAttempt.find({ quiz: quiz._id })
    .populate('student', 'name email')
    .sort({ score: -1 });
  res.status(200).json(attempts);
};

module.exports = { startQuiz, submitQuiz, getMyAttempt, getAttempts };