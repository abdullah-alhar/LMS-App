const express = require('express');
const {
    getQuiz, updateQuiz, setPublished, deleteQuiz,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); //every route below is protected

//fixed path /publish is registered before the plain /:quizId route
router.patch('/:quizId/publish', authorize(['lecturer', 'admin']), setPublished);

router
    .route('/:quizId')
    .get(getQuiz) //owner/admin see answers, enrolled students see published quiz without answers
    .patch(authorize(['lecturer', 'admin']), updateQuiz)
    .delete(authorize(['lecturer', 'admin']), deleteQuiz);

module.exports = router;
