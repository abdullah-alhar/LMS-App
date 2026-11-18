const express = require('express');
const {
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
} = require('../controllers/assignmentController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.post('/:assignmentId/submit', authorize(['student']), upload.single('file'), submitAssignment);
router.get('/:assignmentId/my-submission', authorize(['student']), getMySubmission);
router.get('/:assignmentId/submissions', authorize(['lecturer', 'admin']), getSubmissions);
router.patch('/submissions/:submissionId/grade', authorize(['lecturer', 'admin']), gradeSubmission);
router.route('/:assignmentId').get(getAssignment).patch(authorize(['lecturer', 'admin']), updateAssignment)
  .delete(authorize(['lecturer', 'admin']), deleteAssignment);

module.exports = router;
