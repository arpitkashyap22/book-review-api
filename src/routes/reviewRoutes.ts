import express from 'express';
import { updateReview, deleteReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema } from '../validation/schemas';

const router = express.Router();

router.put('/:id', protect, validate(reviewSchema), updateReview);
router.delete('/:id', protect, deleteReview);

export default router;