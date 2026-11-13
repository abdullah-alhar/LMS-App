const express = require('express');
const {
    createCourse, getCourses, getCourse, updateCourse, deleteCourse,
} = require('../controllers/courseController');
const { enrol, unenrol, getCourseStudents, getMyCourses } = require('../controllers/enrolmentController');
const { addMaterial, getMaterials, deleteMaterial } = require('../controllers/materialController');
const { createQuiz, getQuizzes } = require('../controllers/quizController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); //every route below is protected

//fixed paths like /my must come BEFORE /:id, or "my" is treated as an id
router.get('/my', authorize(['student']), getMyCourses); //a student's own courses

router
    .route('/')
    .get(getCourses) //everyone can view all courses
    .post(authorize(['lecturer']), createCourse); //only lecturers can create courses

router
    .route('/:id')
    .get(getCourse) //everyone can view one course
    .patch(authorize(['lecturer', 'admin']), updateCourse) //role check here, ownership check in controller
    .delete(authorize(['lecturer', 'admin']), deleteCourse);

router
    .route('/:id/enrol')
    .post(authorize(['student']), enrol) //student joins with the key
    .delete(authorize(['student']), unenrol); //student leaves

router.get('/:id/students', authorize(['lecturer', 'admin']), getCourseStudents); //owner sees who joined

//materials: upload.single('file') must come BEFORE addMaterial (multer fills req.body and req.file)
router
    .route('/:id/materials')
    .get(getMaterials) //owner, admin or enrolled students
    .post(authorize(['lecturer', 'admin']), upload.single('file'), addMaterial);

router.delete('/:id/materials/:materialId', authorize(['lecturer', 'admin']), deleteMaterial);

//quizzes
router
    .route('/:id/quizzes')
    .get(getQuizzes) //owner, admin or enrolled students (students see published only)
    .post(authorize(['lecturer', 'admin']), createQuiz);

module.exports = router;