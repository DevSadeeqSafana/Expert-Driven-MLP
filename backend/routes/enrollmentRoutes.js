import express from 'express';
import { enrollInCourse, getMyEnrollments, checkEnrollment } from '../controllers/enrollmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, enrollInCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/check/:courseId', protect, checkEnrollment);

export default router;
