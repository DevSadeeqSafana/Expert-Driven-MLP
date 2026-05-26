import express from 'express';
import {
  applyAsExpert,
  verifyExpert,
  getExperts,
  getPendingApplications
} from '../controllers/expertController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, applyAsExpert);
router.put('/verify/:id', protect, authorize('admin'), verifyExpert);
router.get('/', getExperts);
router.get('/pending', protect, authorize('admin'), getPendingApplications);

export default router;
