const express = require('express');
const { startQuiz, submitQuiz, getMyAttempt, getAttempts } = require('../controllers/attemptController');
const {
    getQuiz, updateQuiz, setPublished, deleteQuiz,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); //every route below is protected

router.post('/:quizId/start', authorize(['student']), startQuiz);
router.post('/:quizId/submit', authorize(['student']), submitQuiz);
router.get('/:quizId/my-attempt', authorize(['student']), getMyAttempt);
router.get('/:quizId/attempts', authorize(['lecturer', 'admin']), getAttempts);
//fixed path /publish is registered before the plain /:quizId route
router.patch('/:quizId/publish', authorize(['lecturer', 'admin']), setPublished);

router
    .route('/:quizId')
    .get(getQuiz) //owner/admin see answers, enrolled students see published quiz without answers
    .patch(authorize(['lecturer', 'admin']), updateQuiz)
    .delete(authorize(['lecturer', 'admin']), deleteQuiz);

module.exports = router;
