const express = require('express');
const { getPendingLecturer, approveLecturer } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize(['admin'])); //every route below is admin-only

router.get('/pending-lecturers', getPendingLecturer);
router.put('/approve-lecturer/:id', approveLecturer);

module.exports = router;
