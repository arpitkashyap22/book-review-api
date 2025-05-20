import express from 'express';
import { 
  createBook, 
  getAllBooks, 
  getBookById, 
  searchBooks 
} from '../controllers/bookController';
import { createReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { 
  bookSchema, 
  reviewSchema, 
  paginationSchema, 
  searchSchema 
} from '../validation/schemas';

const router = express.Router();

// Book routes
router.post('/', protect, validate(bookSchema), createBook);
router.get('/', validateQuery(paginationSchema), getAllBooks);
router.get('/search', validateQuery(searchSchema), searchBooks);
router.get('/:id', getBookById);

// Review routes (related to books)
router.post('/:id/reviews', protect, validate(reviewSchema), createReview);

export default router;