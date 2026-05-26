import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  createLesson
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, authorize('expert', 'admin'), createCourse);
router.post('/lessons', protect, authorize('expert', 'admin'), createLesson);

export default router;
